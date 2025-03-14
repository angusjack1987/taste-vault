
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Recipe } from '../scrape-recipe/types.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

// Constants
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Extracts the main content from a webpage, focusing on text that might contain a recipe
 */
async function extractMainContent(html: string, url: string): Promise<{content: string; imageUrl: string | null}> {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) {
    throw new Error('Failed to parse HTML')
  }

  // Extract title
  const title = doc.querySelector('title')?.textContent || '';
  
  // Try to find the main content area that might contain the recipe
  let mainContent = '';
  
  // Look for common recipe container elements
  const contentSelectors = [
    'article', 
    '.recipe', 
    '.recipe-content', 
    '[itemprop="recipeInstructions"]',
    '.post-content', 
    '.entry-content', 
    '.content',
    'main'
  ];
  
  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = doc.querySelector(selector);
    if (contentElement && contentElement.textContent.length > 200) {
      break;
    }
  }
  
  if (contentElement) {
    mainContent = contentElement.textContent;
  } else {
    // Fallback: take the entire body text
    mainContent = doc.body.textContent;
  }
  
  // Strip excessive whitespace
  mainContent = mainContent.replace(/\s+/g, ' ').trim();
  
  // Find a suitable image
  let imageUrl = null;
  
  // First, try to find an image with recipe or food-related attributes
  const potentialImages = doc.querySelectorAll('img[itemprop="image"], img.recipe-image, img.hero-image');
  if (potentialImages.length > 0) {
    const src = potentialImages[0].getAttribute('src');
    if (src) {
      imageUrl = new URL(src, url).href;
    }
  }
  
  // If no specific recipe image was found, look for any large image
  if (!imageUrl) {
    const allImages = doc.querySelectorAll('img');
    for (const img of Array.from(allImages)) {
      // Skip small icons, logos, etc.
      const src = img.getAttribute('src');
      if (src && 
          !src.includes('logo') && 
          !src.includes('icon') && 
          !src.includes('avatar') &&
          !src.includes('badge')) {
        // Try to get high-res images by looking for attributes like data-src
        const highResSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || src;
        if (highResSrc) {
          imageUrl = new URL(highResSrc, url).href;
          break;
        }
      }
    }
  }
  
  return {
    content: `Title: ${title}\n\nContent: ${mainContent.substring(0, 15000)}`, // Limit content to avoid token limits
    imageUrl
  };
}

/**
 * Uses OpenAI to parse recipe content into structured data
 */
async function parseRecipeWithAI(content: string): Promise<Partial<Recipe>> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
  
  try {
    console.log('Sending content to OpenAI for recipe parsing');
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a specialized recipe parser. Extract a structured recipe from the provided webpage content. 
            Focus on identifying: 
            1. The recipe title
            2. Ingredients list (each item on a separate line)
            3. Step-by-step instructions (each step on a separate line)
            4. Cooking time in minutes
            5. Number of servings
            6. Difficulty level (Easy, Medium, or Hard)
            7. A brief description of the recipe
            8. Tags or categories that apply to the recipe

            Format your response as a JSON object with these fields. 
            If you cannot find a specific value, use null or an empty array as appropriate.
            IMPORTANT: Do not make up information that isn't present.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from the AI
    try {
      // The AI might wrap the JSON in markdown code blocks
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*)\n```/) || 
                       [null, aiResponse];
      
      const jsonString = jsonMatch[1].trim();
      const recipeData = JSON.parse(jsonString);
      
      // Ensure we have the expected fields
      return {
        title: recipeData.title || null,
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        time: typeof recipeData.time === 'number' ? recipeData.time : 
              (recipeData.time ? parseInt(recipeData.time.toString()) : null),
        servings: typeof recipeData.servings === 'number' ? recipeData.servings : 
                 (recipeData.servings ? parseInt(recipeData.servings.toString()) : null),
        difficulty: ['Easy', 'Medium', 'Hard'].includes(recipeData.difficulty) ? 
                   recipeData.difficulty : 'Medium',
        description: recipeData.description || '',
        tags: Array.isArray(recipeData.tags) ? recipeData.tags : []
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI response was:', aiResponse);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    throw error;
  }
}

// Fetch and parse recipe from a URL using AI
async function aiParseRecipe(url: string): Promise<Partial<Recipe>> {
  console.log('Parsing recipe with AI from URL:', url);
  try {
    // First fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Extract main content and potential image URL
    const { content, imageUrl } = await extractMainContent(html, url);
    
    // Parse recipe using AI
    const recipeData = await parseRecipeWithAI(content);
    
    // Add the image URL if we found one
    if (imageUrl) {
      recipeData.image = imageUrl;
    }
    
    return recipeData;
  } catch (error) {
    console.error('Error parsing recipe with AI:', error);
    throw new Error(`Failed to parse recipe with AI: ${error.message}`);
  }
}

// Main handler for the Deno edge function
Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const recipeData = await aiParseRecipe(url);
    
    return new Response(JSON.stringify({ success: true, data: recipeData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

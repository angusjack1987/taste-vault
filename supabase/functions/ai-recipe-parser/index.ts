
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
  
  // Improved hero image finding logic
  let imageUrl = null;
  
  // Helper function to score an image
  const scoreImage = (img: Element): number => {
    let score = 0;
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    
    // Skip tracking pixels, icons, etc.
    if (!src || 
        src.includes('tracking') || 
        src.includes('pixel') || 
        src.includes('icon') || 
        src.includes('logo') || 
        src.includes('avatar') ||
        src.length < 20) {
      return -1;
    }
    
    // Score based on attributes
    const alt = img.getAttribute('alt') || '';
    const className = img.getAttribute('class') || '';
    const id = img.getAttribute('id') || '';
    
    // Score based on size attributes
    const width = parseInt(img.getAttribute('width') || '0', 10);
    const height = parseInt(img.getAttribute('height') || '0', 10);
    
    if (width > 400 || height > 400) score += 20;
    if (width > 200 || height > 200) score += 10;
    
    // Score based on position in document
    const isInHeader = !!img.closest('header');
    const isInArticle = !!img.closest('article');
    
    if (isInArticle) score += 15;
    if (isInHeader) score += 10;
    
    // Score based on naming and content that suggest a featured image
    if (alt.includes('recipe') || alt.includes('dish') || alt.includes('food')) score += 25;
    if (className.includes('hero') || className.includes('featured') || className.includes('main')) score += 25;
    if (id.includes('hero') || id.includes('featured') || id.includes('main')) score += 25;
    
    // Higher score for image names that include common food photo terms
    if (src.includes('hero') || src.includes('featured') || src.includes('main')) score += 15;
    if (src.includes('recipe') || src.includes('dish') || src.includes('food')) score += 15;
    
    // Look for schema.org recipe image attributes
    if (img.getAttribute('itemprop') === 'image') score += 30;
    
    return score;
  };
  
  // First, try to find a specific recipe-related images with schema.org markup
  let schemaImages = doc.querySelectorAll('img[itemprop="image"], [class*="hero"], [class*="featured"], [id*="hero"], [id*="featured"]');
  if (schemaImages.length > 0) {
    // Score all schema-tagged images and use the best one
    const scoredImages = Array.from(schemaImages)
      .map(img => ({ 
        element: img, 
        score: scoreImage(img),
        src: img.getAttribute('src') || img.getAttribute('data-src') || ''
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    if (scoredImages.length > 0) {
      const bestImage = scoredImages[0];
      console.log(`Found schema-marked hero image with score ${bestImage.score}: ${bestImage.src}`);
      const src = bestImage.src;
      if (src) {
        imageUrl = new URL(src, url).href;
      }
    }
  }
  
  // If no schema image was found, score all images on the page
  if (!imageUrl) {
    const allImages = doc.querySelectorAll('img');
    const scoredImages = Array.from(allImages)
      .map(img => ({ 
        element: img, 
        score: scoreImage(img),
        src: img.getAttribute('src') || img.getAttribute('data-src') || ''
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    if (scoredImages.length > 0) {
      const bestImage = scoredImages[0];
      console.log(`Found best hero image with score ${bestImage.score}: ${bestImage.src}`);
      const src = bestImage.src;
      if (src) {
        imageUrl = new URL(src, url).href;
      }
    }
  }
  
  // If still no image found, try common high-res image attributes as fallback
  if (!imageUrl) {
    const allImages = doc.querySelectorAll('img[data-src], img[data-lazy-src], img[data-srcset]');
    for (const img of Array.from(allImages)) {
      const src = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('src');
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
        imageUrl = new URL(src, url).href;
        console.log('Found image using data attribute fallback:', imageUrl);
        break;
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

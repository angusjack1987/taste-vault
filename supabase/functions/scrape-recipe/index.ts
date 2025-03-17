
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.14.0";
import { DOMParser } from "https://esm.sh/linkedom@0.14.21";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle preflight requests
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Extract URL from request
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      throw new Error("URL is required and must be a string");
    }

    console.log(`Scraping recipe from: ${url}`);

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL (${response.status}): ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    // Extract recipe data from the page using AI
    const recipeData = await extractRecipeWithAI(document, url, apiKey);
    
    // Return the recipe data
    console.log("Successfully extracted recipe data");
    return new Response(JSON.stringify(recipeData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in scrape-recipe function:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Find recipe images in the document
function findRecipeImages(document: Document): string[] {
  const images: string[] = [];
  
  // Look for images within recipe-related containers
  const articleImages = document.querySelectorAll('article img, main img, .recipe img, [itemtype*="Recipe"] img');
  articleImages.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
      images.push(src);
    }
  });
  
  // If no recipe-specific images found, get main content images
  if (images.length === 0) {
    const allImages = document.querySelectorAll('img');
    for (const img of allImages) {
      const src = img.getAttribute('src');
      const width = img.getAttribute('width');
      
      // Filter out small images, logos, icons
      if (src && src.startsWith('http') && 
          !src.includes('logo') && !src.includes('icon') &&
          (width === null || parseInt(width) > 200)) {
        images.push(src);
        if (images.length >= 3) break; // Limit to 3 images
      }
    }
  }
  
  return images.slice(0, 3); // Return at most 3 images
}

// Extract recipe data using OpenAI
async function extractRecipeWithAI(document: Document, url: string, apiKey: string) {
  try {
    // Get page title for context
    const title = document.querySelector('title')?.textContent || '';
    
    // Get main content
    const bodyText = document.body.textContent || '';
    const cleanedText = bodyText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000); // Limit text length
    
    // Extract images
    const images = findRecipeImages(document);
    console.log(`Found ${images.length} potential recipe images`);
    
    // Create OpenAI client
    const openai = new OpenAI({ apiKey });
    
    // Define system prompt for recipe extraction
    const systemPrompt = `
      You are an expert at analyzing recipes from webpages. Your task is to extract recipe information into a structured format.
      Only extract the data if you're confident it's a recipe page. If it's not, return an empty object.
      
      Return a JSON object with these fields:
      - title: The recipe name
      - description: A brief description of the recipe
      - ingredients: An array of strings, one ingredient per item
      - instructions: An array of strings, one step per item
      - time: Total cooking time in minutes (numeric only)
      - servings: Number of servings (numeric only)
      - tags: Array of tags or categories (e.g., "dinner", "vegetarian")
    `;
    
    const userPrompt = `
      URL: ${url}
      Page Title: ${title}
      
      Extract the recipe information from this page content:
      ${cleanedText}
      
      Return only the JSON object with the extracted recipe data.
    `;
    
    // Call OpenAI API
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Parse the AI response
    const content = aiResponse.choices[0]?.message?.content || "{}";
    const recipeData = JSON.parse(content);
    
    // Add images to the recipe data
    return {
      ...recipeData,
      images: images,
      image: images.length > 0 ? images[0] : null,
      success: true
    };
  } catch (error) {
    console.error("Error extracting recipe with AI:", error);
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

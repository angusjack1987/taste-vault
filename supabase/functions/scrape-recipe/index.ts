
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.14.0";
import { DOMParser } from "https://esm.sh/linkedom@0.14.21";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let url;
    try {
      const body = await req.json();
      url = body.url;
      
      if (!url || typeof url !== "string") {
        throw new Error("URL is required and must be a string");
      }
    } catch (error) {
      console.error("Error parsing request body:", error.message);
      return new Response(
        JSON.stringify({ error: "Invalid request format", success: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Starting scrape for URL: ${url}`);

    // Check and get OpenAI API key
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error", success: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Fetch the webpage with timeout and retries
    const fetchWithRetry = async (url, retries = 2, timeout = 10000) => {
      let lastError;
      
      for (let i = 0; i <= retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
          }
          
          return await response.text();
        } catch (error) {
          console.warn(`Fetch attempt ${i + 1} failed: ${error.message}`);
          lastError = error;
          
          if (i < retries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      
      throw new Error(`Failed to fetch after ${retries + 1} attempts: ${lastError?.message}`);
    };

    // Fetch the webpage content
    let html;
    try {
      console.log("Fetching webpage content...");
      html = await fetchWithRetry(url);
      console.log(`Successfully fetched ${html.length} bytes of HTML`);
    } catch (error) {
      console.error("Error fetching webpage:", error.message);
      return new Response(
        JSON.stringify({ error: `Failed to fetch webpage: ${error.message}`, success: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Parse the HTML
    let document;
    try {
      const parser = new DOMParser();
      document = parser.parseFromString(html, "text/html");
    } catch (error) {
      console.error("Error parsing HTML:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to parse webpage HTML", success: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extract recipe
    try {
      console.log("Extracting recipe with AI...");
      const recipeData = await extractRecipeWithAI(document, url, apiKey);
      console.log("Recipe extraction successful");
      
      return new Response(
        JSON.stringify({ ...recipeData, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (error) {
      console.error("Error extracting recipe:", error.message);
      return new Response(
        JSON.stringify({ error: `Recipe extraction failed: ${error.message}`, success: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message}`, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Find recipe images in the document
function findRecipeImages(document: Document): string[] {
  const images: string[] = [];
  
  try {
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
    
    console.log(`Found ${images.length} potential recipe images`);
    return images.slice(0, 3); // Return at most 3 images
  } catch (error) {
    console.error("Error finding recipe images:", error);
    return [];
  }
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
    
    console.log("Calling OpenAI API...");
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
    console.log("AI response received, parsing...");
    
    const recipeData = JSON.parse(content);
    
    // Add images to the recipe data
    return {
      ...recipeData,
      images: images,
      image: images.length > 0 ? images[0] : null
    };
  } catch (error) {
    console.error("Error in extractRecipeWithAI:", error);
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

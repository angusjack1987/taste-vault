
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { DOMParser } from "https://esm.sh/linkedom@0.14.17";
import OpenAI from "https://esm.sh/openai@4.14.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to find all images in the DOM that might be recipe-related
function findRecipeImages(document: Document, baseUrl: string): string[] {
  const images: string[] = [];
  
  // Look for images within article, main, or div with specific classes
  const articleImages = document.querySelectorAll('article img, main img, .recipe img, .recipe-image img, [itemtype*="Recipe"] img, .post-content img, .entry-content img');
  articleImages.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.includes('logo') && !src.includes('avatar') && !src.includes('icon') && 
        !src.includes('badge') && !src.includes('pixel.gif')) {
      try {
        // Ensure the URL is absolute
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        if (!images.includes(absoluteUrl)) {
          images.push(absoluteUrl);
        }
      } catch (e) {
        console.error("Error creating absolute URL:", e);
      }
    }
  });
  
  // If we didn't find any, grab more broadly
  if (images.length === 0) {
    const allImages = document.querySelectorAll('img');
    for (const img of allImages) {
      const src = img.getAttribute('src');
      const width = img.getAttribute('width');
      const height = img.getAttribute('height');
      
      // Filter out small images, logos, icons
      if (src && 
          !src.includes('logo') && 
          !src.includes('avatar') && 
          !src.includes('icon') &&
          !src.includes('badge') &&
          !src.includes('pixel.gif') &&
          (width === null || parseInt(width) > 200) &&
          (height === null || parseInt(height) > 200)) {
        try {
          // Ensure the URL is absolute
          const absoluteUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
          if (!images.includes(absoluteUrl)) {
            images.push(absoluteUrl);
          }
        } catch (e) {
          console.error("Error creating absolute URL:", e);
        }
      }
    }
  }
  
  // Also look for high-resolution image URLs in data attributes
  const imgWithDataSrc = document.querySelectorAll('[data-src], [data-lazy-src], [data-original]');
  imgWithDataSrc.forEach(img => {
    const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original');
    if (dataSrc && dataSrc.match(/\.(jpeg|jpg|png|webp)/i)) {
      try {
        const absoluteUrl = dataSrc.startsWith('http') ? dataSrc : new URL(dataSrc, baseUrl).href;
        if (!images.includes(absoluteUrl)) {
          images.push(absoluteUrl);
        }
      } catch (e) {
        console.error("Error creating absolute URL from data attribute:", e);
      }
    }
  });
  
  // Limit to top 3 images
  return images.slice(0, 3);
}

// Creates AI prompts for recipe extraction
function createPrompts(document: Document, url: string) {
  // Get title for context
  const title = document.querySelector('title')?.textContent || '';

  // Extract visible text from the document
  const bodyText = document.body.textContent || '';
  
  // Clean the text (remove extra whitespace)
  const cleanedText = bodyText
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15000); // Limit text length for the AI
  
  const systemPrompt = `
    You are an expert at analyzing recipes from webpages. Your task is to extract recipe information into a structured format.
    Only extract the data if you're confident it's a recipe page. If it's not, return an empty object.
    If you find multiple recipes, focus on the main recipe - usually the one with the most details or mentioned in the page title.
    
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

  return { systemPrompt, userPrompt };
}

// Main handler for the function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const requestData = await req.json();
    const { url } = requestData;
    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Fetching recipe from URL: ${url}`);
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    // Extract images
    const images = findRecipeImages(document, url);
    console.log(`Found ${images.length} potential recipe images:`, images);
    
    // Generate prompts for AI
    const { systemPrompt, userPrompt } = createPrompts(document, url);
    
    // Call OpenAI API
    const openai = new OpenAI({ apiKey });
    
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
    const recipeWithImages = {
      ...recipeData,
      images: images,
      image: images.length > 0 ? images[0] : null
    };

    console.log("Successfully extracted recipe data:", recipeWithImages);
    
    // Return the recipe data
    return new Response(JSON.stringify(recipeWithImages), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

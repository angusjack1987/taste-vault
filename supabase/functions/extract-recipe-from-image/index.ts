
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    console.log("Analyzing recipe image with OpenAI...");
    
    // Send image to OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a specialized recipe parser. Extract a structured recipe from the provided image. 
          Focus on identifying: 
          1. The recipe title
          2. Ingredients list (each item on a separate line)
          3. Step-by-step instructions (each step on a separate line)
          4. Cooking time in minutes (just the number)
          5. Number of servings (just the number)
          6. Difficulty level (Easy, Medium, or Hard)
          7. A brief description of the recipe
          8. Tags or categories that apply to the recipe

          Format your response as a JSON object with these fields:
          {
            "title": "Recipe Title",
            "description": "Brief description",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": ["step 1", "step 2", ...],
            "time": 30,
            "servings": 4,
            "difficulty": "Medium",
            "tags": ["tag1", "tag2", ...]
          }
          
          If you cannot find a specific value, use null or an empty array as appropriate.
          IMPORTANT: Only return valid JSON, no explanations or other text.`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: "text",
              text: "Extract the recipe from this image. Return only a JSON object."
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || "{}";
    const recipeData = JSON.parse(content);
    
    console.log("Successfully extracted recipe data from image");
    
    // Return the recipe data
    return new Response(JSON.stringify(recipeData), {
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

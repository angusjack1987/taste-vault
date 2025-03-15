
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
          content: `You are a specialized recipe parser that extracts detailed recipe information from images.
          
          Analyze the provided image and extract a structured recipe including:
          
          1. Title (be creative if not clearly visible)
          2. Description (provide a brief, appealing description)
          3. Ingredients (complete list with quantities)
          4. Instructions (detailed step-by-step)
          5. Cooking time in minutes (estimate if not specified)
          6. Servings (estimate if not specified)
          7. Difficulty level (Easy, Medium, or Hard)
          8. Tags/categories that would apply to this recipe
          
          Format your response as a clean JSON object with these exact fields:
          {
            "title": "Recipe Title",
            "description": "Brief description",
            "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", ...],
            "instructions": ["step 1", "step 2", ...],
            "time": 30,
            "servings": 4,
            "difficulty": "Medium",
            "tags": ["tag1", "tag2", ...],
            "noTextDetected": false
          }
          
          If you cannot clearly see or determine specific details, make reasonable guesses based on what you can see.
          
          IMPORTANT: If the image contains no visible text at all or clearly isn't a recipe (like a landscape, abstract image, etc.), 
          set "noTextDetected" to true and leave other fields empty. Do not invent a recipe if there's no visible text.
          
          Only return valid JSON, no explanations or other text.`
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
              text: "Extract the complete recipe from this image. Return only a JSON object with all fields filled. If no recipe text is visible, set noTextDetected to true."
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || "{}";
    console.log("Raw AI response:", content);
    
    let recipeData;
    try {
      recipeData = JSON.parse(content);
      
      // Check if no text was detected
      if (recipeData.noTextDetected === true) {
        console.log("No recipe text detected in the image");
        return new Response(JSON.stringify({ 
          noTextDetected: true,
          error: "No recipe text detected in this image" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Validate and ensure all fields exist
      recipeData = {
        title: recipeData.title || "Untitled Recipe",
        description: recipeData.description || "A delicious recipe",
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        time: typeof recipeData.time === 'number' ? recipeData.time : 30,
        servings: typeof recipeData.servings === 'number' ? recipeData.servings : 4,
        difficulty: ['Easy', 'Medium', 'Hard'].includes(recipeData.difficulty) ? recipeData.difficulty : 'Medium',
        tags: Array.isArray(recipeData.tags) ? recipeData.tags : [],
        noTextDetected: false
      };
      
      console.log("Successfully parsed recipe data from image:", recipeData);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI response");
    }
    
    // Return the recipe data
    return new Response(JSON.stringify(recipeData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error extracting recipe from image:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

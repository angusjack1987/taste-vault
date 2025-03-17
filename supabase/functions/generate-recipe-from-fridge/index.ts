
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// OpenAI API configuration
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

interface UserFoodPreferences {
  favoriteCuisines?: string;
  favoriteChefs?: string;
  ingredientsToAvoid?: string;
  dietaryNotes?: string;
}

interface AISettings {
  model?: string;
  temperature?: number;
  promptHistoryEnabled?: boolean;
  userPreferences?: {
    responseStyle?: "concise" | "balanced" | "detailed";
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const {
      type,
      data,
      aiSettings,
    } = await req.json();
    
    const userId = data?.userId;
    
    console.log("Generate recipe from fridge - Type:", type);
    console.log("Generate recipe from fridge - Data:", data);
    console.log("Generate recipe from fridge - AI Settings:", aiSettings);

    let result;
    
    if (type === "generate-recipe") {
      if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        throw new Error("No ingredients provided");
      }
      
      // Generate recipes from the ingredients
      const prompt = generateRecipePrompt(data.ingredients, data.userFoodPreferences, aiSettings, data.singleRecipe);
      result = await getRecipesFromAI(prompt, aiSettings);
    } else {
      throw new Error(`Unknown operation type: ${type}`);
    }

    // Log the prompt to history if enabled
    if (aiSettings?.promptHistoryEnabled !== false && userId) {
      try {
        // Store the full response and prompt for later retrieval
        const responsePreview = JSON.stringify(result).substring(0, 150) + '...';
        const fullPrompt = "Generate recipe from fridge ingredients: " + data.ingredients.join(", ");
        const fullResponse = JSON.stringify(result);
          
        await supabaseClient.from('ai_prompt_history').insert({
          user_id: userId,
          endpoint: "generate-recipe-from-fridge",
          prompt: fullPrompt,
          response_preview: responsePreview,
          full_response: fullResponse,
          model: aiSettings?.model,
          temperature: aiSettings?.temperature
        });
        
        console.log("Prompt history logged with full response");
      } catch (error) {
        console.error("Error logging prompt history:", error);
      }
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating recipes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

function generateRecipePrompt(
  ingredients: string[],
  userFoodPreferences: UserFoodPreferences | null,
  aiSettings?: AISettings,
  singleRecipe?: boolean
): string {
  const detailLevel = aiSettings?.userPreferences?.responseStyle || "balanced";
  // If singleRecipe is true, always create just 1 recipe
  const recipeCount = singleRecipe ? "1 recipe" : (detailLevel === "concise" ? "1 recipe" : "2 recipes");
  
  let prompt = `Create ${recipeCount} that primarily uses these ingredients:\n`;
  prompt += ingredients.join(", ");
  prompt += "\n\n";
  prompt += "You can include additional ingredients not listed if necessary to create complete, delicious recipes.\n";

  // Add user's food preferences if available
  if (userFoodPreferences) {
    prompt += "Please consider the following user preferences:\n";
    
    if (userFoodPreferences.favoriteCuisines) {
      prompt += `- Favorite cuisines: ${userFoodPreferences.favoriteCuisines}\n`;
    }
    if (userFoodPreferences.favoriteChefs) {
      prompt += `- Favorite chefs/styles: ${userFoodPreferences.favoriteChefs}\n`;
    }
    if (userFoodPreferences.ingredientsToAvoid) {
      prompt += `- Ingredients to avoid: ${userFoodPreferences.ingredientsToAvoid}\n`;
    }
    if (userFoodPreferences.dietaryNotes) {
      prompt += `- Dietary notes: ${userFoodPreferences.dietaryNotes}\n`;
    }
  }

  prompt += `\nFor each recipe, provide:
1. Title
2. Brief description
3. List of ingredients with quantities
4. Step by step instructions
5. Preparation time
6. Number of servings
7. Any special highlights (e.g. "high-protein", "quick", "vegetarian")

Format your response in JSON with the following structure:
{
  "recipes": [
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "highlights": ["highlight1", "highlight2"],
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "time": preparationTimeInMinutes,
      "servings": numberOfServings
    }
  ]
}`;

  return prompt;
}

async function getRecipesFromAI(prompt: string, aiSettings?: AISettings): Promise<any[]> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const model = aiSettings?.model || "gpt-3.5-turbo";
  const temperature = aiSettings?.temperature !== undefined ? aiSettings.temperature : 0.7;

  console.log(`Using model: ${model}, temperature: ${temperature}`);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    try {
      // Extract JSON object from the content (in case of additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData.recipes || [];
      }
      throw new Error("No valid JSON found in the response");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      
      // Attempt to fix using another AI call
      return parseRecipesWithAI(content, aiSettings);
    }
  } catch (error) {
    console.error("Error generating recipes with OpenAI:", error);
    throw new Error(`Failed to generate recipes: ${error.message}`);
  }
}

async function parseRecipesWithAI(content: string, aiSettings?: AISettings): Promise<any[]> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const fixPrompt = `Parse the following text into a proper JSON format with recipes:

${content}

The response should be in this exact format:
{
  "recipes": [
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "highlights": ["highlight1", "highlight2"],
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "time": preparationTimeInMinutes,
      "servings": numberOfServings
    }
  ]
}

Please ensure the result is valid JSON.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: aiSettings?.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: fixPrompt }],
      temperature: 0.3, // Lower temperature for more deterministic parsing
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to parse recipes format");
  }

  const data = await response.json();
  const parsedContent = data.choices[0].message.content;

  try {
    // Extract JSON object
    const jsonMatch = parsedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return parsedData.recipes || [];
    }
    throw new Error("Failed to parse recipes");
  } catch (error) {
    console.error("Error parsing fixed AI response:", error);
    
    // If all else fails, return a manually constructed minimal recipe
    return [{
      title: "Recipe from Ingredients",
      description: "A recipe based on your ingredients",
      ingredients: ["See original ingredients list"],
      instructions: ["See AI generated instructions"],
      rawContent: content
    }];
  }
}

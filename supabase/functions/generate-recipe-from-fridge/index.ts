
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, userFoodPreferences } = await req.json();
    
    if (!ingredients || ingredients.length === 0) {
      throw new Error('No ingredients provided');
    }

    console.log("Generating recipes with ingredients:", ingredients);
    
    // Format user preferences if provided
    const userPrefsString = formatUserPreferences(userFoodPreferences);
    
    // Prepare the prompt for generating multiple recipe options
    const prompt = `Create TWO different recipe options using some or all of these ingredients: ${ingredients.join(', ')}. 
${userPrefsString}

For EACH recipe, provide the following in JSON format:
{
  "title": "Recipe Title",
  "description": "A brief appealing description of the dish",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "ingredients": ["ingredient with quantity 1", "ingredient with quantity 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "time": estimated_minutes_to_prepare,
  "servings": number_of_servings
}

Return your response as a JSON array with exactly two recipe objects:
[
  {first recipe object},
  {second recipe object}
]

Not all ingredients need to be used in each recipe, but use as many as possible to create delicious, cohesive dishes. Make the recipes distinct from each other - different cuisines or cooking methods.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a skilled chef that specializes in creating delicious recipes from available ingredients. You always return responses in the exact JSON format requested, with no additional text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message || 'Error generating recipes');
    }

    const recipeContent = data.choices[0].message.content;
    console.log("Recipes generated successfully");
    
    // Parse the JSON response and ensure it's in the correct format
    let recipeOptions = [];
    try {
      const parsedContent = JSON.parse(recipeContent);
      if (Array.isArray(parsedContent) && parsedContent.length > 0) {
        recipeOptions = parsedContent;
      } else {
        // Fall back if we didn't get an array
        recipeOptions = [{ rawContent: recipeContent }];
      }
    } catch (e) {
      console.error("Error parsing recipe JSON:", e);
      // If parsing fails, return the raw text
      recipeOptions = [{ rawContent: recipeContent }];
    }

    return new Response(
      JSON.stringify({ recipes: recipeOptions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-recipe-from-fridge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to format user preferences
function formatUserPreferences(userFoodPreferences: any): string {
  if (!userFoodPreferences) return '';
  
  // Ensure userFoodPreferences is an object
  if (typeof userFoodPreferences !== 'object' || Array.isArray(userFoodPreferences)) return '';
  
  let prefString = 'Consider these user preferences:';
  
  if (userFoodPreferences.favoriteCuisines) {
    prefString += ` Favorite cuisines: ${userFoodPreferences.favoriteCuisines}.`;
  }
  
  if (userFoodPreferences.ingredientsToAvoid) {
    prefString += ` Ingredients to avoid: ${userFoodPreferences.ingredientsToAvoid}.`;
  }
  
  if (userFoodPreferences.dietaryNotes) {
    prefString += ` Additional dietary notes: ${userFoodPreferences.dietaryNotes}.`;
  }
  
  return prefString;
}


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

    console.log("Generating recipe with ingredients:", ingredients);
    
    // Format user preferences if provided
    const userPrefsString = formatUserPreferences(userFoodPreferences);
    
    // Prepare the prompt for generating a recipe
    const prompt = `Create a recipe using some or all of these ingredients: ${ingredients.join(', ')}. 
${userPrefsString}

The recipe should include:
1. A creative title
2. A brief description
3. Ingredients list (with quantities)
4. Step-by-step instructions
5. Approximate cooking time and servings

Not all ingredients need to be used, but use as many as possible to create a delicious, cohesive dish.`;

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
            content: 'You are a skilled chef that specializes in creating delicious recipes from available ingredients. Be creative and provide detailed, easy-to-follow recipes.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message || 'Error generating recipe');
    }

    const recipeContent = data.choices[0].message.content;
    console.log("Recipe generated successfully");

    return new Response(
      JSON.stringify({ recipe: recipeContent }),
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

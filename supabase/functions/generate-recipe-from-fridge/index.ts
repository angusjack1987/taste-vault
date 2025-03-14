
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
    const { ingredients, userFoodPreferences, aiSettings, userId } = await req.json();
    
    if (!ingredients || ingredients.length === 0) {
      throw new Error('No ingredients provided');
    }

    console.log("Generating recipes with ingredients:", ingredients);
    console.log("User preferences:", userFoodPreferences || "None provided");
    
    // Format user preferences if provided
    const userPrefsString = formatUserPreferences(userFoodPreferences);
    
    // Add response style adjustment based on user settings
    let styleGuidance = '';
    if (aiSettings?.userPreferences?.responseStyle) {
      const styleMap = {
        concise: 'Be concise and focused in your recipe descriptions.',
        balanced: 'Provide a moderate level of detail in your recipe instructions.',
        detailed: 'Include comprehensive details and explanations in your recipes.'
      };
      styleGuidance = styleMap[aiSettings.userPreferences.responseStyle];
    }
    
    // Prepare the prompt for generating multiple recipe options
    const prompt = `Create TWO different recipe options using some or all of these ingredients: ${ingredients.join(', ')}. 
${userPrefsString}
${styleGuidance}

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

Return your response as a JSON object with the following structure:
{
  "options": [
    {first recipe object},
    {second recipe object}
  ]
}

Not all ingredients need to be used in each recipe, but use as many as possible to create delicious, cohesive dishes. Make the recipes distinct from each other - different cuisines or cooking methods.`;

    console.log("Sending prompt to OpenAI API");

    // Get the selected model and temperature from user settings, or use defaults
    const model = aiSettings?.model || 'gpt-4o-mini';
    const temperature = aiSettings?.temperature !== undefined ? aiSettings.temperature : 0.7;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a skilled chef that specializes in creating delicious recipes from available ingredients. You always return responses in the exact JSON format requested, with no additional text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message || 'Error generating recipes');
    }

    const recipeContent = data.choices[0].message.content;
    console.log("Raw recipe content:", recipeContent.substring(0, 200) + "...");
    
    // Parse the JSON response and ensure it's in the correct format
    let recipeOptions = [];
    try {
      const parsedContent = JSON.parse(recipeContent);
      
      if (parsedContent.options && Array.isArray(parsedContent.options)) {
        // If we got the expected format with options array
        recipeOptions = parsedContent.options;
        console.log(`Successfully parsed ${recipeOptions.length} recipe options`);
      } else if (Array.isArray(parsedContent) && parsedContent.length > 0) {
        // If we got a direct array (no options wrapper)
        recipeOptions = parsedContent;
        console.log(`Parsed ${recipeOptions.length} recipe options from direct array`);
      } else {
        // If we got an unexpected format
        console.log("Unexpected response format, wrapping raw content");
        recipeOptions = [{ title: "Recipe Suggestion", rawContent: recipeContent }];
      }
    } catch (e) {
      console.error("Error parsing recipe JSON:", e);
      // If parsing fails, return the raw text
      recipeOptions = [{ title: "Recipe Suggestion", rawContent: recipeContent }];
    }

    // If prompt history is enabled and user ID is provided, store the prompt
    if (aiSettings?.promptHistoryEnabled && userId) {
      try {
        const { error } = await fetch(
          `${req.url.split('/functions/')[0]}/rest/v1/ai_prompt_history`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': Deno.env.get('SUPABASE_API_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_API_KEY') || ''}`,
            },
            body: JSON.stringify({
              user_id: userId,
              endpoint: 'generate-recipe-from-fridge',
              prompt: prompt,
              response_preview: JSON.stringify(recipeOptions).substring(0, 200) + '...',
              timestamp: new Date().toISOString(),
            }),
          }
        ).then(res => res.json());
        
        if (error) {
          console.error("Error saving prompt history:", error);
        }
      } catch (historyError) {
        console.error("Failed to save prompt history:", historyError);
      }
    }

    const result = { recipes: recipeOptions };
    console.log(`Returning ${recipeOptions.length} recipe options`);
    
    return new Response(
      JSON.stringify(result),
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

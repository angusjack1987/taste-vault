
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
    const { type, data, aiSettings } = await req.json();
    
    let prompt = '';
    let systemPrompt = 'You are an AI assistant specialized in recipe suggestions and meal planning. Be concise and provide practical advice.';
    
    // Adjust system prompt based on user's response style preference
    if (aiSettings?.userPreferences?.responseStyle) {
      const styleMap = {
        concise: 'Be extremely concise and to the point in your responses.',
        balanced: 'Provide moderately detailed responses with a balance of information.',
        detailed: 'Provide comprehensive and detailed information in your responses.'
      };
      systemPrompt += ' ' + styleMap[aiSettings.userPreferences.responseStyle];
    }
    
    // Process the user's food preferences if available
    const formatUserPreferences = (userFoodPreferences: any) => {
      if (!userFoodPreferences) return '';
      
      // Ensure userFoodPreferences is an object
      if (typeof userFoodPreferences !== 'object' || Array.isArray(userFoodPreferences)) return '';
      
      let prefString = 'Based on these user preferences:';
      
      if (userFoodPreferences.favoriteCuisines) {
        prefString += ` Favorite cuisines: ${userFoodPreferences.favoriteCuisines}.`;
      }
      
      if (userFoodPreferences.favoriteChefs) {
        prefString += ` Favorite chefs/cooks: ${userFoodPreferences.favoriteChefs}.`;
      }
      
      if (userFoodPreferences.ingredientsToAvoid) {
        prefString += ` Ingredients to avoid: ${userFoodPreferences.ingredientsToAvoid}.`;
      }
      
      if (userFoodPreferences.dietaryNotes) {
        prefString += ` Additional notes: ${userFoodPreferences.dietaryNotes}.`;
      }
      
      return prefString;
    };
    
    if (type === 'suggest-recipes') {
      const { preferences, dietaryRestrictions, userFoodPreferences } = data;
      
      // Include user's stored food preferences in the prompt
      const userPrefsString = formatUserPreferences(userFoodPreferences);
      
      prompt = `Suggest 3 recipe ideas ${preferences ? `based on these preferences: ${preferences}` : ''} ${dietaryRestrictions ? `with these dietary restrictions: ${dietaryRestrictions}` : ''}. ${userPrefsString} For each recipe, provide the title, a brief description, and a list of main ingredients.`;
      
      console.log("Recipe suggestion prompt:", prompt);
    } else if (type === 'analyze-meal-plan') {
      const { mealPlan } = data;
      prompt = `Analyze this weekly meal plan and provide feedback on nutritional balance and suggest improvements: ${JSON.stringify(mealPlan)}`;
    } else if (type === 'generate-recipe') {
      const { title, ingredients, userFoodPreferences } = data;
      
      // Include user's stored food preferences in the prompt
      const userPrefsString = formatUserPreferences(userFoodPreferences);
      
      prompt = `Create a complete recipe for "${title}" using these main ingredients: ${ingredients}. ${userPrefsString} Include detailed instructions, cooking time, and serving size.`;
      
      console.log("Recipe generation prompt:", prompt);
    } else if (type === 'suggest-meal-for-plan') {
      const { mealType, season, additionalPreferences, userFoodPreferences } = data;
      
      // Include user's stored food preferences in the prompt
      const userPrefsString = formatUserPreferences(userFoodPreferences);
      
      const seasonalConsideration = season 
        ? `Consider that it's currently ${season} season, but don't put too much emphasis on it.` 
        : '';
      
      prompt = `Suggest TWO different recipe options for ${mealType}. ${seasonalConsideration} ${additionalPreferences ? `Additional preferences: ${additionalPreferences}.` : ''} ${userPrefsString}

For EACH recipe, return in this JSON format:
{
  "options": [
    {
      "title": "First Recipe Title",
      "description": "Brief description",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "time": estimated_minutes_to_prepare,
      "servings": number_of_servings
    },
    {
      "title": "Second Recipe Title",
      "description": "Brief description",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "time": estimated_minutes_to_prepare,
      "servings": number_of_servings
    }
  ]
}`;
      
      console.log("Meal suggestion prompt:", prompt);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
      }),
    });

    const data_response = await response.json();
    console.log("OpenAI response:", JSON.stringify(data_response));
    
    if (data_response.error) {
      throw new Error(data_response.error.message || 'Error calling OpenAI API');
    }

    const aiResponse = data_response.choices[0].message.content;
    
    // If prompt history is enabled and user ID is provided, store the prompt
    if (aiSettings?.promptHistoryEnabled && data.userId) {
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
              user_id: data.userId,
              endpoint: type,
              prompt: prompt,
              response_preview: aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : ''),
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

    return new Response(
      JSON.stringify({ result: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in AI recipe suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

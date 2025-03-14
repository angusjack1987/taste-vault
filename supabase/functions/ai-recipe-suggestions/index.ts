
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

interface RequestData {
  type: "suggest-recipes" | "analyze-meal-plan" | "suggest-meal-for-plan";
  data: any;
  aiSettings?: AISettings;
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

    // Parse request body
    const requestData: RequestData = await req.json();
    const { type, data, aiSettings } = requestData;

    console.log("Request type:", type);
    console.log("AI Settings:", aiSettings);

    // Process request based on type
    let result;
    let prompt;

    switch (type) {
      case "suggest-recipes":
        prompt = generateRecipeSuggestionsPrompt(data, aiSettings);
        result = await getOpenAiCompletion(prompt, aiSettings);
        break;
      case "analyze-meal-plan":
        prompt = generateMealPlanAnalysisPrompt(data, aiSettings);
        result = await getOpenAiCompletion(prompt, aiSettings);
        break;
      case "suggest-meal-for-plan":
        prompt = generateMealSuggestionPrompt(data, aiSettings);
        result = await getOpenAiCompletion(prompt, aiSettings);
        
        // Try to parse the AI response to extract structured meal suggestions
        try {
          const parsedResult = await parseMealSuggestion(result, aiSettings);
          result = parsedResult;
        } catch (error) {
          console.error("Error parsing meal suggestion:", error);
          // Fall back to the raw response if parsing fails
        }
        break;
      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    // Log the prompt to history if enabled
    if (aiSettings?.promptHistoryEnabled !== false && data.userId) {
      try {
        // Store a truncated version of the response for history
        const responsePreview = typeof result === 'string' 
          ? result.substring(0, 150) + (result.length > 150 ? '...' : '')
          : JSON.stringify(result).substring(0, 150) + '...';
          
        await supabaseClient.from('ai_prompt_history').insert({
          user_id: data.userId,
          endpoint: type,
          prompt: prompt,
          response_preview: responsePreview,
          model: aiSettings?.model,
          temperature: aiSettings?.temperature
        });
        
        console.log("Prompt history logged");
      } catch (error) {
        console.error("Error logging prompt history:", error);
      }
    }

    // Return result
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

// Function to generate recipe suggestions prompt
function generateRecipeSuggestionsPrompt(data: any, aiSettings?: AISettings): string {
  const {
    preferences = "",
    dietaryRestrictions = "",
    userFoodPreferences = null,
  } = data;

  let promptStyle = "Please suggest 5 recipes";
  
  if (aiSettings?.userPreferences?.responseStyle === "concise") {
    promptStyle = "Please briefly suggest 3 recipes";
  } else if (aiSettings?.userPreferences?.responseStyle === "detailed") {
    promptStyle = "Please suggest 5 detailed recipes with full instructions";
  }

  let prompt = `${promptStyle} based on the following criteria:\n\n`;

  if (preferences) {
    prompt += `User preferences: ${preferences}\n`;
  }

  if (dietaryRestrictions) {
    prompt += `Dietary restrictions: ${dietaryRestrictions}\n`;
  }

  // Add user's stored food preferences if available
  if (userFoodPreferences) {
    if (userFoodPreferences.favoriteCuisines) {
      prompt += `Favorite cuisines: ${userFoodPreferences.favoriteCuisines}\n`;
    }
    if (userFoodPreferences.favoriteChefs) {
      prompt += `Favorite chefs or cooking styles: ${userFoodPreferences.favoriteChefs}\n`;
    }
    if (userFoodPreferences.ingredientsToAvoid) {
      prompt += `Ingredients to avoid: ${userFoodPreferences.ingredientsToAvoid}\n`;
    }
    if (userFoodPreferences.dietaryNotes) {
      prompt += `Additional dietary notes: ${userFoodPreferences.dietaryNotes}\n`;
    }
  }

  prompt += "\nFor each recipe, include the name and a brief description.";

  return prompt;
}

// Function to generate meal plan analysis prompt
function generateMealPlanAnalysisPrompt(data: any, aiSettings?: AISettings): string {
  const { mealPlan } = data;

  let detailLevel = "balanced";
  if (aiSettings?.userPreferences?.responseStyle) {
    detailLevel = aiSettings.userPreferences.responseStyle;
  }

  const meals = mealPlan.map((meal: any) => {
    const date = new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    return `${date} - ${meal.meal_type}: ${meal.recipe ? meal.recipe.title : 'No meal planned'}`;
  }).join("\n");

  let prompt = `Analyze the following meal plan and provide insights. ${
    detailLevel === "concise" 
      ? "Keep your analysis brief and to the point." 
      : detailLevel === "detailed"
      ? "Provide detailed analysis with specific recommendations for improvement."
      : "Provide a balanced analysis with some recommendations."
  }\n\n`;
  
  prompt += `Meal Plan:\n${meals}\n\n`;
  
  prompt += "Please analyze for:\n";
  prompt += "1. Nutritional balance\n";
  prompt += "2. Variety of cuisines and ingredients\n";
  prompt += "3. Suggestions for improvements or additions\n";
  
  if (detailLevel === "detailed") {
    prompt += "4. Potential nutrient deficiencies\n";
    prompt += "5. Ideas for healthy snacks to complement the meals\n";
  }

  return prompt;
}

// Function to generate meal suggestion prompt
function generateMealSuggestionPrompt(data: any, aiSettings?: AISettings): string {
  const {
    mealType,
    season,
    additionalPreferences = "",
    userFoodPreferences = null,
  } = data;

  let detailLevel = "balanced";
  if (aiSettings?.userPreferences?.responseStyle) {
    detailLevel = aiSettings.userPreferences.responseStyle;
  }

  let prompt = `Suggest ${detailLevel === "concise" ? "1 recipe" : "2 different recipes"} for ${mealType} that would be appropriate for ${season} season.`;

  if (additionalPreferences) {
    prompt += ` Consider these preferences: ${additionalPreferences}.`;
  }

  // Add user's stored food preferences if available
  if (userFoodPreferences) {
    prompt += "\n\nPlease also consider the user's food profile:";
    
    if (userFoodPreferences.favoriteCuisines) {
      prompt += `\nFavorite cuisines: ${userFoodPreferences.favoriteCuisines}`;
    }
    if (userFoodPreferences.favoriteChefs) {
      prompt += `\nFavorite chefs or cooking styles: ${userFoodPreferences.favoriteChefs}`;
    }
    if (userFoodPreferences.ingredientsToAvoid) {
      prompt += `\nIngredients to avoid: ${userFoodPreferences.ingredientsToAvoid}`;
    }
    if (userFoodPreferences.dietaryNotes) {
      prompt += `\nAdditional dietary notes: ${userFoodPreferences.dietaryNotes}`;
    }
  }

  prompt += `\n\nFor each recipe, provide:
1. Title
2. Brief description
3. List of ingredients with quantities
4. Step by step instructions
5. Preparation time
6. Number of servings
7. Any special highlights (e.g. "high-protein", "quick", "vegetarian")

Format your response in JSON with the following structure:
{
  "options": [
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

// Function to parse AI meal suggestion responses
async function parseMealSuggestion(response: string, aiSettings?: AISettings): Promise<any> {
  try {
    // Look for JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      const parsedResponse = JSON.parse(jsonString);
      
      // Validate expected structure
      if (parsedResponse && parsedResponse.options && Array.isArray(parsedResponse.options)) {
        return parsedResponse;
      }
    }
    
    // If no valid JSON found or doesn't have expected structure,
    // use OpenAI to parse the unstructured response
    const parsePrompt = `Parse the following meal suggestion into a structured JSON format:

${response}

Please format as:
{
  "options": [
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

Ensure all data is accurately extracted from the text.`;

    const parsedResult = await getOpenAiCompletion(parsePrompt, aiSettings);
    
    // Extract JSON from the resulting text
    const parsedJsonMatch = parsedResult.match(/\{[\s\S]*\}/);
    if (parsedJsonMatch) {
      return JSON.parse(parsedJsonMatch[0]);
    }
    
    // If all parsing attempts fail, return the original response
    return { rawResponse: response };
    
  } catch (error) {
    console.error("Error parsing meal suggestion:", error);
    return { rawResponse: response };
  }
}

// Function to communicate with OpenAI API
async function getOpenAiCompletion(prompt: string, aiSettings?: AISettings): Promise<string> {
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
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`Failed to get AI completion: ${error.message}`);
  }
}

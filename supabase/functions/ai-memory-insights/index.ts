
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

interface AISettings {
  model?: string;
  temperature?: number;
  useMemory?: boolean;
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

    const { userId, aiSettings } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("Generating insights for user:", userId);
    
    // Check if memory feature is disabled
    if (aiSettings?.useMemory === false) {
      return new Response(
        JSON.stringify({ 
          insights: "AI Memory feature is currently disabled in your settings. Enable it to get personalized cooking insights based on your recipe history."
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fetch user's recipes
    const { data: recipes, error: recipesError } = await supabaseClient
      .from("recipes")
      .select("*")
      .eq("user_id", userId);

    if (recipesError) {
      throw new Error(`Error fetching recipes: ${recipesError.message}`);
    }

    // Fetch meal plans
    const { data: mealPlans, error: mealPlansError } = await supabaseClient
      .from("meal_plans")
      .select("*, recipe:recipes(*)")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(60); // Get last ~2 months of meal plans

    if (mealPlansError) {
      throw new Error(`Error fetching meal plans: ${mealPlansError.message}`);
    }

    // Fetch prompt history
    const { data: promptHistory, error: promptHistoryError } = await supabaseClient
      .from("ai_prompt_history")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(20); // Get last 20 prompts

    if (promptHistoryError) {
      throw new Error(`Error fetching prompt history: ${promptHistoryError.message}`);
    }
    
    // Generate insights using OpenAI
    const insights = await generateInsights({
      recipes,
      mealPlans,
      promptHistory,
      aiSettings
    });

    // Log prompt history (optional)
    try {
      const responsePreview = insights.substring(0, 150) + (insights.length > 150 ? '...' : '');
      
      await supabaseClient.from('ai_prompt_history').insert({
        user_id: userId,
        endpoint: "ai-memory-insights",
        prompt: "Generate culinary insights based on user data",
        response_preview: responsePreview,
        model: aiSettings?.model,
        temperature: aiSettings?.temperature
      });
      
      console.log("Memory insights logged to prompt history");
    } catch (error) {
      console.error("Error logging to prompt history:", error);
    }

    return new Response(JSON.stringify({ insights }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

async function generateInsights(data: any): Promise<string> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const { recipes, mealPlans, promptHistory, aiSettings } = data;

  const model = aiSettings?.model || "gpt-4o-mini";
  const temperature = aiSettings?.temperature !== undefined ? aiSettings.temperature : 0.7;

  console.log(`Using model: ${model}, temperature: ${temperature}`);

  // Extract recipe tags and ingredients to identify preferences
  const recipeTags = recipes.flatMap((recipe: any) => recipe.tags || []);
  
  // Get meal plan patterns
  const mealTypes = mealPlans.map((plan: any) => plan.meal_type || "");
  const plannedRecipes = mealPlans
    .filter((plan: any) => plan.recipe)
    .map((plan: any) => ({
      title: plan.recipe.title,
      date: plan.date,
      mealType: plan.meal_type
    }));

  // Extract AI interaction patterns
  const aiPrompts = promptHistory.map((item: any) => item.prompt || "");

  // Create a prompt for OpenAI
  const prompt = `
You are an AI cooking assistant with memory capabilities. Analyze the following data about a user's cooking habits and preferences to generate personalized insights.

RECIPE DATA (${recipes.length} recipes):
- Recipe tags: ${JSON.stringify(recipeTags.slice(0, 100))}
- Number of recipes: ${recipes.length}

MEAL PLANNING DATA:
- Recent meal plans by type: ${JSON.stringify(mealTypes.slice(0, 50))}
- Recently planned recipes: ${JSON.stringify(plannedRecipes.slice(0, 10))}

AI INTERACTION HISTORY:
- Recent AI prompts: ${JSON.stringify(aiPrompts.slice(0, 10))}

Based on this data, provide the following insights:
1. Culinary Preferences: What cuisines, ingredients, or dish types does the user seem to prefer?
2. Cooking Patterns: Any observable patterns in their meal planning or recipe creation?
3. Personalized Suggestions: 2-3 specific recipe or meal planning suggestions based on their history
4. AI Usage Patterns: How they tend to use AI for cooking assistance

Format your response in a conversational, friendly manner. Include specific examples from their data when possible. Keep your total response under 500 words.
`;

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
    console.error("Error generating insights with OpenAI:", error);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
}

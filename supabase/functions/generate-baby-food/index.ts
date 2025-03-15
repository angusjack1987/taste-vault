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

interface BabyFoodPreferences {
  babyAge?: string;
  babyFoodPreferences?: string;
  ingredientsToAvoid?: string;
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

    const requestData = await req.json();
    
    // Check if this is a food advice request
    if (requestData.adviceRequest) {
      return handleFoodAdviceRequest(requestData, supabaseClient);
    }
    
    // Otherwise handle the standard recipe generation
    const {
      ingredients,
      babyFoodPreferences,
      aiSettings,
      userId
    } = requestData;

    console.log("Generating baby food recipes from ingredients:", ingredients);
    console.log("Baby preferences:", babyFoodPreferences);
    console.log("AI Settings:", aiSettings);

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error("No ingredients provided");
    }

    // Generate baby food recipes from the ingredients
    const prompt = generateBabyFoodPrompt(ingredients, babyFoodPreferences, aiSettings);
    const recipes = await getRecipesFromAI(prompt, aiSettings);

    // Log the prompt to history if enabled
    if (aiSettings?.promptHistoryEnabled !== false && userId) {
      try {
        // Store a truncated version of the response
        const responsePreview = JSON.stringify(recipes).substring(0, 150) + '...';
          
        await supabaseClient.from('ai_prompt_history').insert({
          user_id: userId,
          endpoint: "generate-baby-food",
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

    return new Response(JSON.stringify({ recipes }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating baby food recipes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

// Handle food advice request
async function handleFoodAdviceRequest(requestData: any, supabaseClient: any) {
  const { food, babyAge, babyName, userId, aiSettings } = requestData;
  
  if (!food) {
    throw new Error("No food specified for advice");
  }
  
  console.log(`Generating advice for ${food} for ${babyName || 'baby'} at ${babyAge || 'unknown'} months`);
  
  // Generate advice for serving the food to a baby
  const prompt = generateFoodAdvicePrompt(food, babyAge, babyName);
  const advice = await getFoodAdviceFromAI(prompt, aiSettings);
  
  // Log the prompt to history if enabled
  if (aiSettings?.promptHistoryEnabled !== false && userId) {
    try {
      // Store a truncated version of the response
      const responsePreview = advice.substring(0, 150) + '...';
        
      await supabaseClient.from('ai_prompt_history').insert({
        user_id: userId,
        endpoint: "baby-food-advice",
        prompt: prompt,
        response_preview: responsePreview,
        model: aiSettings?.model,
        temperature: aiSettings?.temperature
      });
      
      console.log("Food advice prompt history logged");
    } catch (error) {
      console.error("Error logging food advice prompt history:", error);
    }
  }
  
  return new Response(JSON.stringify({ advice }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function generateFoodAdvicePrompt(food: string, babyAge?: string, babyName?: string): string {
  const childName = babyName ? babyName : "your baby";
  const ageText = babyAge ? `${babyAge} months old` : "your baby";
  
  return `Please provide comprehensive, evidence-based advice on how to safely serve ${food} to ${childName} who is ${ageText}. 

Format your response as HTML that can be rendered in a web application, with appropriate headings, paragraphs, and lists.

Your response should include:
1. Whether ${food} is appropriate for the child's age
2. How to prepare ${food} to be safe and age-appropriate (texture, size, cooking method)
3. Signs of readiness to introduce this food
4. Potential allergen information if applicable
5. Nutritional benefits of ${food} for babies
6. How to serve suggestions (finger food, spoon-feeding, etc.)
7. Storage guidelines if relevant

Please follow these guidelines:
- Prioritize safety first
- Use evidence-based information similar to resources like SolidStarts
- Be specific with preparation suggestions 
- Mention any age-specific considerations
- Format the response with HTML tags for headings, paragraphs, and bullet points
- Keep the tone informative yet conversational
- Use food-safety best practices

If ${food} is NOT appropriate for the baby's age, clearly state that first and provide alternatives.`;
}

async function getFoodAdviceFromAI(prompt: string, aiSettings?: AISettings): Promise<string> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const model = aiSettings?.model || "gpt-4o-mini";
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
    return content;
  } catch (error) {
    console.error("Error generating food advice with OpenAI:", error);
    throw new Error(`Failed to generate food advice: ${error.message}`);
  }
}

function generateBabyFoodPrompt(
  ingredients: string[],
  babyFoodPreferences: BabyFoodPreferences | null,
  aiSettings?: AISettings
): string {
  const detailLevel = aiSettings?.userPreferences?.responseStyle || "balanced";
  
  let prompt = `Create ${detailLevel === "concise" ? "1 baby food recipe" : "2 baby food recipes"} using some or all of these ingredients:\n`;
  prompt += ingredients.join(", ");
  prompt += "\n\n";

  // Add baby food preferences if available
  if (babyFoodPreferences) {
    prompt += "Please consider the following baby preferences:\n";
    
    if (babyFoodPreferences.babyAge) {
      prompt += `- Baby's age: ${babyFoodPreferences.babyAge} months\n`;
    }
    if (babyFoodPreferences.babyFoodPreferences) {
      prompt += `- Baby food preferences: ${babyFoodPreferences.babyFoodPreferences}\n`;
    }
    if (babyFoodPreferences.ingredientsToAvoid) {
      prompt += `- Ingredients to avoid: ${babyFoodPreferences.ingredientsToAvoid}\n`;
    }
  }

  prompt += `\nGuidelines for baby food recipes:
- Recipes should be age-appropriate based on baby's age
- Emphasize nutrition and balanced meals
- Include smooth textures for babies under 8 months
- Consider finger foods for older babies
- Avoid added salt, sugar, and honey for babies under 12 months
- Ensure recipes are easy to prepare

For each recipe, provide:
1. Title
2. Brief description
3. Age appropriateness (in months)
4. List of ingredients with quantities
5. Step by step instructions (simple, focused on safety and nutrition)
6. Preparation time
7. Storage tips
8. Nutritional highlights

Format your response in JSON with the following structure:
{
  "recipes": [
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "ageRange": "X-Y months",
      "highlights": ["highlight1", "highlight2"],
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "time": preparationTimeInMinutes,
      "storageTips": "Storage information",
      "nutritionalBenefits": ["benefit1", "benefit2"]
    }
  ]
}`;

  return prompt;
}

async function getRecipesFromAI(prompt: string, aiSettings?: AISettings): Promise<any[]> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const model = aiSettings?.model || "gpt-4o-mini";
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
      
      // Return a minimal recipe structure with the raw content
      return [{
        title: "Baby Food Recipe",
        description: "A baby food recipe based on your ingredients",
        ingredients: ["See original ingredients list"],
        instructions: ["See instructions in description"],
        rawContent: content
      }];
    }
  } catch (error) {
    console.error("Error generating recipes with OpenAI:", error);
    throw new Error(`Failed to generate baby food recipes: ${error.message}`);
  }
}

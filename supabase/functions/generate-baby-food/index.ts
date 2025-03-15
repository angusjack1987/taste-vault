
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import 'https://deno.land/x/xhr@0.1.0/mod.ts';

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
    const { adviceRequest, food, babyAge, babyName, ingredients, babyFoodPreferences } = await req.json();
    
    console.log(`Processing ${adviceRequest ? 'food advice' : 'recipe generation'} request`);
    
    if (adviceRequest) {
      // Handle food advice request
      const prompt = `
You are a trusted baby nutrition expert specializing in baby-led weaning and introducing solid foods to babies based on their developmental stage. Your advice should be clear, practical, and focused on safety and nutrition.

I need advice on how to serve "${food}" to a ${babyAge}-month-old baby ${babyName ? `named ${babyName}` : ''}.

Please provide:
1. Whether this food is safe at this age
2. How to prepare it (cooking method, texture, size/shape)
3. Any specific safety precautions
4. Nutritional benefits
5. Signs of readiness or allergies to watch for

Format your response as plain text paragraphs that are easy to read. Do not include any HTML tags or markdown formatting.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful baby nutrition expert providing clear advice without any HTML formatting.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const advice = data.choices[0].message.content;

      console.log(`Generated food advice for ${food}`);
      
      return new Response(
        JSON.stringify({ advice }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Handle recipe generation request
      let systemPrompt = `
You are a baby food chef specializing in creating nutritious, age-appropriate recipes for babies. You focus on whole foods, minimal processing, and age-appropriate textures.
`;

      let userPrompt = `
Create a baby food recipe using some or all of these ingredients: ${ingredients.join(', ')}.

The baby is ${babyAge} months old.

${babyFoodPreferences ? `Additional preferences: ${babyFoodPreferences}` : ''}

Please format your response as a valid JSON object with the following structure:
{
  "title": "Recipe name",
  "description": "Brief description of the recipe",
  "ageRange": "Appropriate age range (e.g., '6-8 months')",
  "highlights": ["Quick to make", "Freezer friendly", etc],
  "ingredients": ["Ingredient 1", "Ingredient 2", etc],
  "instructions": ["Step 1", "Step 2", etc],
  "time": preparation time in minutes (number),
  "storageTips": "How to store leftovers",
  "nutritionalBenefits": ["Benefit 1", "Benefit 2", etc]
}

The JSON should be an array with 1-3 recipe variations. Make sure the JSON is valid and properly formatted.
`;

      console.log(`Generating baby food recipes with ingredients: ${ingredients.join(', ')}`);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const recipeText = data.choices[0].message.content;
      
      let recipes = [];
      try {
        // Extract the JSON part from the response
        const jsonMatch = recipeText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
          recipes = JSON.parse(jsonMatch[0]);
          // Ensure recipes is an array
          if (!Array.isArray(recipes)) {
            recipes = [recipes];
          }
        } else {
          throw new Error('No valid JSON found in the response');
        }
      } catch (error) {
        console.error('Error parsing recipe JSON:', error);
        recipes = [{ 
          title: "Baby Food Recipe", 
          description: "There was an error formatting the recipe properly. Here's the raw output:",
          rawContent: recipeText
        }];
      }

      console.log(`Generated ${recipes.length} baby food recipes`);
      
      return new Response(
        JSON.stringify(recipes),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-baby-food function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

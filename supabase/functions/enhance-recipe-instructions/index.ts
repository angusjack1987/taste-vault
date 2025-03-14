
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (type !== 'enhance-recipe-instructions') {
      throw new Error(`Unsupported request type: ${type}`);
    }
    
    const { recipeTitle, instructions, ingredients } = data;
    
    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      throw new Error('Invalid instructions data');
    }
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error('Invalid ingredients data');
    }

    console.log("Enhancing recipe instructions for:", recipeTitle);
    console.log("Instructions count:", instructions.length);
    console.log("Ingredients count:", ingredients.length);

    // Use the AI settings from the request if available, otherwise use defaults
    const model = aiSettings?.model || 'gpt-4o-mini';
    const temperature = aiSettings?.temperature || 0.7;

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
            content: `
              You are a cooking expert AI that helps explain recipe instructions.
              You will analyze recipe instructions and ingredients to add helpful tooltips.
              For each instruction step, identify key terms that benefit from tooltips.
              
              For each tooltip, extract:
              1. The exact text in the instruction that needs a tooltip
              2. The ingredient it relates to
              3. A brief explanation of the technique, why it's important, or tips for success
              
              Format your response as a valid JSON array where each object has:
              - step: the full instruction text
              - tooltips: array of objects with {text, ingredient, explanation}
            `
          },
          {
            role: 'user',
            content: `
              Recipe: "${recipeTitle}"
              
              Instructions:
              ${instructions.map((step, i) => `${i+1}. ${step}`).join('\n')}
              
              Ingredients:
              ${ingredients.map(ing => `- ${ing}`).join('\n')}
              
              Create concise, helpful tooltips for key terms in each instruction step.
            `
          }
        ],
        temperature: temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data_response = await response.json();
    const enhancedInstructions = data_response.choices[0].message.content;
    
    console.log("Raw response from OpenAI:", enhancedInstructions.substring(0, 200) + "...");
    
    // Parse the response and validate it
    let parsedInstructions;
    try {
      parsedInstructions = JSON.parse(enhancedInstructions);
      
      // Basic validation
      if (!Array.isArray(parsedInstructions)) {
        throw new Error('Response is not an array');
      }
      
      // Make sure the structure matches what we expect
      parsedInstructions.forEach((instruction, i) => {
        if (!instruction.step || !Array.isArray(instruction.tooltips)) {
          throw new Error(`Invalid instruction format at index ${i}`);
        }
      });
      
      // Make sure we have one entry per instruction
      if (parsedInstructions.length !== instructions.length) {
        console.warn(`Warning: Received ${parsedInstructions.length} steps but expected ${instructions.length}`);
        // Try to match instructions by content
        const correctedInstructions = instructions.map(originalStep => {
          // Find matching step or create default
          const match = parsedInstructions.find(enhanced => 
            enhanced.step.toLowerCase().includes(originalStep.toLowerCase().substring(0, 20))
          );
          return match || { step: originalStep, tooltips: [] };
        });
        parsedInstructions = correctedInstructions;
      }
      
      console.log("Successfully parsed response with", parsedInstructions.length, "instructions");
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', enhancedInstructions);
      
      // Fallback: create a simple version if parsing fails
      parsedInstructions = instructions.map(step => ({
        step: step,
        tooltips: [],
      }));
      
      console.log("Using fallback parsed instructions");
    }

    return new Response(
      JSON.stringify({ 
        result: parsedInstructions
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in enhance-recipe-instructions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});

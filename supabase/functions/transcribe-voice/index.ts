
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of common non-food items to filter out
const nonFoodKeywords = [
  "add", "get", "buy", "purchase", "grab", "pick up", "need", "want", "list",
  "item", "items", "thing", "things", "stuff", "product", "products",
  "note", "notes", "reminder", "reminders", "remember", "remind",
  "and", "also", "too", "as well", "the", "a", "an", "some", "few", "many",
  "hello", "hi", "hey", "please", "thanks", "thank you", "okay", "ok", "sure",
  "yeah", "yes", "no", "not", "don't", "do not", "can't", "cannot",
  "put", "place", "store", "keep", "save", "write", "record", "note down",
  "like", "such as", "including", "for example", "e.g.",
  "to", "for", "from", "in", "on", "at", "by", "with", "about", "over", "under",
  "my", "our", "your", "their", "his", "her", "its", "mine", "yours", "theirs",
  "this", "that", "these", "those", "it", "they", "them", "we", "you", "I", "me",
  "should", "would", "could", "might", "may", "can", "will", "shall", "must"
];

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  console.log(`Processing base64 string of length: ${base64String.length}`);
  
  // Check if we actually have data
  if (!base64String || base64String.length === 0) {
    throw new Error("Empty audio data provided");
  }
  
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  console.log(`Processed ${chunks.length} chunks, total size: ${result.length} bytes`);
  return result;
}

// Function to process transcribed text and filter out non-food items
function processFoodItems(text: string): string[] {
  // First, clean and normalize the text
  const normalizedText = text.toLowerCase().trim();
  
  // Check for empty text
  if (!normalizedText) {
    return [];
  }
  
  // Split by common separators (commas, 'and', newlines)
  let items = normalizedText.split(/[,\n]|(\sand\s)/).map(item => item?.trim()).filter(Boolean);
  
  // Further split by phrases like "I need" or "I want"
  const processedItems: string[] = [];
  
  for (const item of items) {
    // Skip common connectors that were split out
    if (item === 'and') continue;
    
    // Split by common phrases that introduce lists
    const splitItems = item.split(/(?:i\s+need|i\s+want|please\s+add|add|get|buy)\s+/).filter(Boolean);
    
    for (const splitItem of splitItems) {
      // Clean up the item and remove any trailing punctuation
      const cleanedItem = splitItem.trim().replace(/[.!?]$/, '');
      
      if (cleanedItem) {
        processedItems.push(cleanedItem);
      }
    }
  }
  
  // Filter out non-food items by removing items that are just common non-food keywords
  const foodItems = processedItems.filter(item => {
    // If the item is just a single word, check if it's a non-food keyword
    if (/^\s*\w+\s*$/.test(item)) {
      return !nonFoodKeywords.includes(item.trim());
    }
    return true;
  });
  
  console.log("Processed food items:", foodItems);
  return foodItems;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request for transcription");
    const { audio } = await req.json();
    
    if (!audio) {
      console.error("No audio data provided");
      throw new Error('No audio data provided');
    }

    console.log(`Received audio data of length: ${audio.length}`);
    
    if (!openAIApiKey) {
      console.error("OpenAI API key not configured");
      throw new Error('OpenAI API key not configured');
    }
    
    // Add validation to ensure we have valid base64 data
    if (audio.trim() === "") {
      console.error("Empty audio data");
      throw new Error('Empty audio data provided');
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Additional validation for processed audio
    if (!binaryAudio || binaryAudio.length === 0) {
      console.error("Failed to process audio data");
      throw new Error('Failed to process audio data');
    }
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log("Sending audio to OpenAI API for transcription...");
    
    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription received:", result.text);
    
    // Process the transcribed text to extract food items
    const foodItems = processFoodItems(result.text);

    return new Response(
      JSON.stringify({ 
        text: result.text,
        foodItems: foodItems
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in transcribe-voice function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

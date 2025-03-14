import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced list of common non-food keywords to filter out
const nonFoodKeywords = [
  // Common verbs and actions
  "add", "get", "buy", "purchase", "grab", "pick up", "need", "want", "list",
  "item", "items", "thing", "things", "stuff", "product", "products",
  "note", "notes", "reminder", "reminders", "remember", "remind",
  "put", "place", "store", "keep", "save", "write", "record", "note down",
  "pulled", "hauled", "grabbed", "took", "barked", "woof",
  
  // Common articles, conjunctions, prepositions
  "and", "also", "too", "as well", "the", "a", "an", "some", "few", "many",
  "to", "for", "from", "in", "on", "at", "by", "with", "about", "over", "under", "until",
  
  // Common greetings and responses
  "hello", "hi", "hey", "please", "thanks", "thank you", "okay", "ok", "sure",
  "yeah", "yes", "no", "not", "don't", "do not", "can't", "cannot",
  
  // Descriptors and phrases
  "like", "such as", "including", "for example", "e.g.",
  
  // Pronouns and possessives
  "my", "our", "your", "their", "his", "her", "its", "mine", "yours", "theirs",
  "this", "that", "these", "those", "it", "they", "them", "we", "you", "I", "me",
  
  // Modal verbs and auxiliaries
  "should", "would", "could", "might", "may", "can", "will", "shall", "must",
  
  // Common animals and non-food objects
  "dog", "cat", "pet", "animal", "boy", "girl", "man", "woman", "child", "person", "people",
  "bank", "house", "home", "car", "vehicle", "phone", "computer", "book", "table", "chair",
  "school", "work", "office", "shop", "store", "mall", "market",
  
  // Common adjectives
  "small", "big", "large", "tiny", "huge", "little", "good", "bad", "nice", "great",
  "hot", "cold", "warm", "cool", "new", "old", "young", "beautiful", "ugly", "pretty"
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

// Common food categories to help with validation
const foodCategories = [
  // Proteins
  "chicken", "beef", "pork", "fish", "seafood", "lamb", "turkey", "duck", "tofu", "eggs",
  "shellfish", "shrimp", "crab", "lobster", "salmon", "tuna", "meat", "steak", "ribs",
  
  // Dairy and alternatives
  "milk", "cheese", "yogurt", "butter", "cream", "ice cream", "sour cream", "dairy", 
  "oat milk", "almond milk", "soy milk", "coconut milk", "cashew milk", "yoghurt",
  
  // Fruits
  "apple", "orange", "banana", "grape", "strawberry", "blueberry", "raspberry", "pear",
  "peach", "plum", "kiwi", "mango", "pineapple", "melon", "watermelon", "lemon", "lime",
  "cherry", "berries", "fruit",
  
  // Vegetables
  "lettuce", "spinach", "kale", "carrot", "potato", "tomato", "cucumber", "pepper",
  "onion", "garlic", "broccoli", "cauliflower", "corn", "peas", "green beans", "asparagus",
  "zucchini", "eggplant", "mushroom", "cabbage", "celery", "avocado", "vegetable", "veggies",
  
  // Grains
  "rice", "pasta", "bread", "cereal", "oats", "wheat", "flour", "quinoa", "barley",
  "couscous", "noodle", "tortilla", "wrap", "grain", "granola",
  
  // Legumes
  "beans", "lentils", "chickpeas", "peas", "peanuts", "soy", "tofu", "tempeh",
  
  // Nuts and seeds
  "almonds", "walnuts", "peanuts", "cashews", "pistachios", "seeds", "chia", "flax",
  "sunflower seeds", "sesame seeds", "nut", "nuts",
  
  // Baking
  "sugar", "flour", "baking powder", "baking soda", "yeast", "vanilla", "chocolate",
  "cocoa", "cinnamon", "spices", "salt", "pepper", "oil", "vinegar",
  
  // Processed foods
  "cereal", "crackers", "chips", "cookies", "cake", "candy", "chocolate", "snack",
  "frozen food", "canned food", "soup", "sauce", "condiment", "dressing", "marinade",
  
  // Beverages
  "water", "juice", "soda", "tea", "coffee", "wine", "beer", "alcohol", "drink", "beverage",
  
  // Other
  "honey", "jam", "jelly", "syrup", "peanut butter", "nutella", "spread", "dip",
  "hummus", "salsa", "guacamole", "olive oil", "cooking oil"
];

// Function to determine if a phrase could be a food item
function isFoodItem(text: string): boolean {
  // Normalize the text
  const normalizedText = text.toLowerCase().trim();
  
  // Very short inputs are unlikely to be food
  if (normalizedText.length < 3) {
    return false;
  }
  
  // Check if the text contains any food-related keywords
  for (const foodWord of foodCategories) {
    if (normalizedText.includes(foodWord)) {
      return true;
    }
  }
  
  // Split into words
  const words = normalizedText.split(/\s+/);
  
  // If the phrase is very long (more than 5 words) and doesn't contain any food words,
  // it's likely not a food item
  if (words.length > 5) {
    return false;
  }
  
  // Count how many words in the phrase are in our non-food list
  const nonFoodWordCount = words.filter(word => 
    nonFoodKeywords.includes(word.toLowerCase().replace(/[.,!?]$/, ''))
  ).length;
  
  // If more than half the words are non-food words, it's probably not a food item
  if (nonFoodWordCount > words.length / 2) {
    return false;
  }
  
  // If the input starts with common sentence starters that indicate non-food contexts
  const nonFoodPrefixes = [
    "i want", "i need", "get me", "please get", "can you", "could you", 
    "would you", "the dog", "my dog", "the cat", "my cat", "the boy", "the girl",
    "they are", "he is", "she is", "it is", "there is", "there are"
  ];
  
  for (const prefix of nonFoodPrefixes) {
    if (normalizedText.startsWith(prefix)) {
      return false;
    }
  }
  
  // If the phrase has animal sounds or common non-food verbs
  const nonFoodPatterns = [
    /\bwoof\b/, /\bmeow\b/, /\bbark(s|ed|ing)?\b/, /\bpull(s|ed|ing)?\b/, 
    /\bhaul(s|ed|ing)?\b/, /\bgrab(s|bed|bing)?\b/, /\btook\b/, /\btake(s|n)?\b/
  ];
  
  for (const pattern of nonFoodPatterns) {
    if (pattern.test(normalizedText)) {
      return false;
    }
  }
  
  // If the input has preparation instructions in parentheses, it's likely a food item
  const prepPhrases = ['chopped', 'diced', 'minced', 'sliced', 'grated', 'peeled', 'crushed',
    'julienned', 'cubed', 'shredded', 'torn', 'crumbled', 'pitted', 'halved',
    'quartered', 'finely', 'roughly', 'coarsely', 'thinly', 'to taste', 'for garnish'];
  
  for (const prep of prepPhrases) {
    if (normalizedText.includes(prep)) {
      return true;
    }
  }
  
  // Default to accepting the item if it passes all our filters
  return true;
}

// Enhanced function to process transcribed text and extract food items
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
      // Before cleaning, check if we have preparation instructions to preserve
      const hasPrepInstructions = /(chopped|diced|minced|sliced|grated|finely|roughly|to taste)/i.test(splitItem);
      
      // Clean up the item and remove any trailing punctuation
      let cleanedItem = splitItem.trim().replace(/[.!?]$/, '');
      
      // Remove measurement notes in parentheses but preserve preparation instructions
      if (hasPrepInstructions) {
        cleanedItem = cleanedItem.replace(/\(\s*about\s+[\d\/]+.*?\)/gi, '');
      } else {
        cleanedItem = cleanedItem.replace(/\([^)]*\)/g, '');
      }
      
      cleanedItem = cleanedItem.trim();
      
      if (cleanedItem && isFoodItem(cleanedItem)) {
        processedItems.push(cleanedItem);
      }
    }
  }
  
  console.log("Processed food items:", processedItems);
  return processedItems;
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

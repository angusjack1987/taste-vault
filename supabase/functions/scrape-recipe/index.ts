import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Recipe } from './types.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

/**
 * Cleans up an ingredient string by removing notes in parentheses and extra commas
 * Example: "300g / 10oz green beans ((Note 1))" -> "300g/10oz green beans"
 */
function cleanIngredient(ingredient: string): string {
  if (!ingredient) return '';
  
  // Extract preparation instructions in italics if present
  // This regex looks for text in between common italic markers like <i>, <em>, or even CSS styling
  const italicPattern = /<(?:i|em)[^>]*>([^<]+)<\/(?:i|em)>|<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([^<]+)<\/span>/i;
  const italicMatch = ingredient.match(italicPattern);
  let prepInstruction = '';
  
  if (italicMatch) {
    // Capture the instruction from either the first or second capture group
    prepInstruction = (italicMatch[1] || italicMatch[2]).trim();
    
    // Remove the italic element from the ingredient
    ingredient = ingredient.replace(italicMatch[0], '').trim();
  }
  
  // Check for preparation instructions in parentheses
  const prepInParentheses = /\((chopped|diced|minced|sliced|grated|peeled|crushed|julienned|cubed|shredded|torn|crumbled|pitted|halved|quartered|finely|roughly|to taste|for garnish)/i;
  if (prepInParentheses.test(ingredient)) {
    // Keep the first set of parentheses that has preparation instructions
    const parenthesesMatch = ingredient.match(/\(([^)]*(?:chopped|diced|minced|sliced|grated|peeled|crushed|julienned|cubed|shredded|torn|crumbled|pitted|halved|quartered|finely|roughly|to taste|for garnish)[^)]*)\)/i);
    if (parenthesesMatch) {
      const extractedPrep = parenthesesMatch[1].trim();
      
      // Only extract as prep instruction if it doesn't contain "note" or numbers that look like measurements
      if (!/(note|cup|about)/i.test(extractedPrep)) {
        // Save the prep instruction
        prepInstruction = prepInstruction ? `${prepInstruction}, ${extractedPrep}` : extractedPrep;
      }
    }
  }
  
  // Standard cleaning for other ingredients
  let cleaned = ingredient;
  let previousCleaned = '';
  
  // Handle potentially nested parentheses by running the replacement multiple times
  while (previousCleaned !== cleaned) {
    previousCleaned = cleaned;
    cleaned = cleaned.replace(/\([^)]*\)/g, '');
  }
  
  // Remove trailing brackets
  cleaned = cleaned.replace(/\s*\)\s*$/, '');
  
  // Fix double commas and commas followed by spaces
  cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+/g, ' ');
  
  // Remove any trailing commas
  cleaned = cleaned.replace(/,\s*$/, '');
  
  // Format dual measurement format to be consistent (e.g., "300g / 10oz" -> "300g/10oz")
  cleaned = cleaned.replace(/(\d+\s*(?:g|kg|ml|l|oz|lb))\s*\/\s*(\d+\s*(?:g|kg|ml|l|oz|lb))/gi, '$1/$2');
  
  // Normalize spaces
  cleaned = cleaned.trim();
  
  // Add back the preparation instruction if we extracted one
  if (prepInstruction) {
    // Make sure we don't have a trailing comma before adding the prep instruction
    cleaned = cleaned.replace(/,\s*$/, '');
    cleaned = `${cleaned}, ${prepInstruction}`;
  }
  
  return cleaned;
}

/**
 * Parse time string to minutes
 * Examples: "PT15M", "PT1H30M", "15 mins", "1 hour 30 minutes"
 */
function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  
  // Handle ISO 8601 duration format (e.g., PT15M, PT1H30M)
  const isoDurationMatch = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (isoDurationMatch) {
    const hours = parseInt(isoDurationMatch[1] || '0', 10);
    const minutes = parseInt(isoDurationMatch[2] || '0', 10);
    return (hours * 60) + minutes;
  }
  
  // Handle human-readable format (e.g., "15 mins", "1 hour 30 minutes")
  const hourMatch = timeStr.match(/(\d+)\s*(?:hour|hr|h)/i);
  const minuteMatch = timeStr.match(/(\d+)\s*(?:minute|min|m)/i);
  
  let totalMinutes = 0;
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }
  
  // If we just have a number, assume it's minutes
  if (!hourMatch && !minuteMatch && /^\d+$/.test(timeStr.trim())) {
    totalMinutes = parseInt(timeStr.trim(), 10);
  }
  
  return totalMinutes > 0 ? totalMinutes : null;
}

// Extract recipe data from HTML content
async function extractRecipeData(html: string, url: string): Promise<Partial<Recipe>> {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) {
    throw new Error('Failed to parse HTML')
  }

  console.log('Extracting recipe data from URL:', url)

  // Initialize recipe data with default values
  const recipe: Partial<Recipe> = {
    title: '',
    ingredients: [],
    instructions: [],
    time: null,
    image: null,
    tags: []
  }

  // Try to extract structured data (JSON-LD)
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]')
  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const scriptContent = jsonLdScripts[i].textContent || ''
      const jsonData = JSON.parse(scriptContent)
      
      // Check if it's a Recipe schema
      const recipeData = jsonData['@graph'] 
        ? jsonData['@graph'].find((item: any) => item['@type'] === 'Recipe') 
        : jsonData['@type'] === 'Recipe' ? jsonData : null
      
      if (recipeData) {
        console.log('Found JSON-LD recipe data')
        
        // Extract title
        recipe.title = recipeData.name || recipe.title
        
        // Extract ingredients and clean them
        if (recipeData.recipeIngredient && Array.isArray(recipeData.recipeIngredient)) {
          recipe.ingredients = recipeData.recipeIngredient
            .map((i: string) => cleanIngredient(String(i).trim()))
            .filter(Boolean)
        }
        
        // Extract instructions
        if (recipeData.recipeInstructions) {
          if (Array.isArray(recipeData.recipeInstructions)) {
            recipe.instructions = recipeData.recipeInstructions.map((inst: any) => {
              if (typeof inst === 'string') return inst
              return inst.text || inst.description || ''
            }).filter(Boolean)
          } else if (typeof recipeData.recipeInstructions === 'string') {
            recipe.instructions = [recipeData.recipeInstructions]
          }
        }
        
        // Extract cooking times
        let totalMinutes = 0;
        
        // Total time (preferred if available)
        if (recipeData.totalTime) {
          const totalTime = parseTimeToMinutes(recipeData.totalTime);
          if (totalTime) {
            recipe.time = totalTime;
            totalMinutes = totalTime;
          }
        }
        
        // If total time wasn't found or is zero, try cook time + prep time
        if (!totalMinutes) {
          if (recipeData.cookTime) {
            const cookTime = parseTimeToMinutes(recipeData.cookTime);
            if (cookTime) totalMinutes += cookTime;
          }
          
          if (recipeData.prepTime) {
            const prepTime = parseTimeToMinutes(recipeData.prepTime);
            if (prepTime) totalMinutes += prepTime;
          }
          
          if (totalMinutes > 0) {
            recipe.time = totalMinutes;
          }
        }
        
        // Extract image
        if (recipeData.image) {
          if (typeof recipeData.image === 'string') {
            recipe.image = recipeData.image
          } else if (Array.isArray(recipeData.image) && recipeData.image.length > 0) {
            const imgItem = recipeData.image[0]
            recipe.image = typeof imgItem === 'string' ? imgItem : imgItem.url
          } else if (recipeData.image.url) {
            recipe.image = recipeData.image.url
          }
          
          console.log('Found recipe image in JSON-LD:', recipe.image)
        }
        
        // Extract tags/categories
        if (recipeData.recipeCategory) {
          const categories = Array.isArray(recipeData.recipeCategory) 
            ? recipeData.recipeCategory 
            : [recipeData.recipeCategory]
          recipe.tags = [...recipe.tags, ...categories]
        }
        
        if (recipeData.keywords) {
          const keywords = typeof recipeData.keywords === 'string'
            ? recipeData.keywords.split(',').map((k: string) => k.trim())
            : Array.isArray(recipeData.keywords) ? recipeData.keywords : []
          recipe.tags = [...recipe.tags, ...keywords]
        }
        
        break
      }
    } catch (e) {
      console.error('Error parsing JSON-LD:', e)
    }
  }

  // Fallback methods if structured data wasn't found or was incomplete
  
  // If ingredients weren't found or have HTML in them, try finding them in the DOM
  if (recipe.ingredients.length === 0 || recipe.ingredients.some(ing => /<[a-z][\s\S]*>/i.test(ing))) {
    const ingredientLists = doc.querySelectorAll('.ingredients, .ingredient-list, ul[class*="ingredient"]')
    for (let i = 0; i < ingredientLists.length; i++) {
      const listItems = ingredientLists[i].querySelectorAll('li')
      if (listItems.length > 3) {  // Assume a list with at least 3 items could be ingredients
        recipe.ingredients = Array.from(listItems)
          .map(item => cleanIngredient(item.innerHTML || item.textContent || ''))
          .filter(Boolean)
        break
      }
    }
    
    // If still no ingredients, try another fallback approach
    if (recipe.ingredients.length === 0) {
      const allLists = doc.querySelectorAll('ul')
      for (let i = 0; i < allLists.length; i++) {
        const listItems = allLists[i].querySelectorAll('li')
        if (listItems.length > 3) {  // Assume a list with at least 3 items could be ingredients
          const potentialIngredients = Array.from(listItems)
            .map(item => item.innerHTML || item.textContent || '')
            .filter(Boolean)
          
          // Check if at least half of the items might be ingredients (contain measurements or common food words)
          const ingredientPattern = /\d+\s*(?:g|kg|ml|l|oz|lb|cup|tbsp|tsp|teaspoon|tablespoon|pinch|dash)/i
          const foodWords = /\b(?:salt|pepper|oil|butter|sugar|flour|water|milk|egg|garlic|onion|chicken|beef|pork|fish)\b/i
          
          const ingredientCount = potentialIngredients.filter(item => 
            ingredientPattern.test(item) || foodWords.test(item)
          ).length
          
          if (ingredientCount >= potentialIngredients.length / 2) {
            recipe.ingredients = potentialIngredients.map(item => cleanIngredient(item))
            break
          }
        }
      }
    }
  }
  
  // Title fallback
  if (!recipe.title) {
    const titleElement = doc.querySelector('h1')
    if (titleElement) {
      recipe.title = titleElement.textContent?.trim() || ''
    }
  }
  
  // Time fallback - look for common time patterns in the page
  if (!recipe.time) {
    // Common time patterns like "15 minutes", "Total: 25 mins", "Cook time: 30 min"
    const timeRegex = /(?:total|cook(?:ing)?|prep(?:aration)?|time)[\s\:]*(\d+)[\s]*(min|minute|m|hour|hr|h)/i;
    const bodyText = doc.body.textContent || '';
    const timeMatch = bodyText.match(timeRegex);
    
    if (timeMatch) {
      const value = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      
      if (unit.startsWith('h')) {
        recipe.time = value * 60; // Convert hours to minutes
      } else {
        recipe.time = value;
      }
    }
  }
  
  // Image fallback - improved to find the best hero image for the recipe
  if (!recipe.image) {
    console.log('Looking for hero image in the page')
    
    // Helper function to score an image's likelihood of being a hero image
    const scoreImage = (img: Element): number => {
      let score = 0
      const src = img.getAttribute('src') || img.getAttribute('data-src') || ''
      
      // Skip tracking pixels, icons, etc.
      if (!src || 
          src.includes('tracking') || 
          src.includes('pixel') || 
          src.includes('icon') || 
          src.includes('logo') || 
          src.includes('avatar') ||
          src.length < 20) {
        return -1
      }

      // Check image attributes
      const alt = img.getAttribute('alt') || ''
      const className = img.getAttribute('class') || ''
      const id = img.getAttribute('id') || ''
      
      // Score based on size attributes
      const width = parseInt(img.getAttribute('width') || '0', 10)
      const height = parseInt(img.getAttribute('height') || '0', 10)
      
      if (width > 400 || height > 400) score += 20
      if (width > 200 || height > 200) score += 10
      
      // Score based on position in document
      const isInHeader = !!img.closest('header')
      const isInArticle = !!img.closest('article')
      
      if (isInArticle) score += 15
      if (isInHeader) score += 10
      
      // Score based on naming conventions that suggest a featured image
      if (alt.includes('recipe') || alt.includes('dish') || alt.includes('food')) score += 25
      if (className.includes('hero') || className.includes('featured') || className.includes('main')) score += 25
      if (id.includes('hero') || id.includes('featured') || id.includes('main')) score += 25
      
      // Higher score for image names that include common food photo terms
      if (src.includes('hero') || src.includes('featured') || src.includes('main')) score += 15
      if (src.includes('recipe') || src.includes('dish') || src.includes('food')) score += 15
      
      return score
    }
    
    // Try to find hero images first
    const allImages = doc.querySelectorAll('img')
    const scoredImages = Array.from(allImages)
      .map(img => ({ 
        element: img, 
        score: scoreImage(img),
        src: img.getAttribute('src') || img.getAttribute('data-src') || ''
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
    
    if (scoredImages.length > 0) {
      const topImage = scoredImages[0]
      console.log(`Found best hero image with score ${topImage.score}: ${topImage.src}`)
      recipe.image = new URL(topImage.src, url).href
    } else {
      // Fallback to first large image if no hero found
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i]
        const src = img.getAttribute('src')
        const dataSrc = img.getAttribute('data-src')
        if (src && !src.includes('logo') && !src.includes('icon')) {
          recipe.image = new URL(src, url).href
          break
        } else if (dataSrc && !dataSrc.includes('logo') && !dataSrc.includes('icon')) {
          recipe.image = new URL(dataSrc, url).href
          break
        }
      }
    }
  }
  
  // Try to identify instructions
  if (recipe.instructions.length === 0) {
    // Look for ordered lists
    const instructionLists = doc.querySelectorAll('ol')
    for (let i = 0; i < instructionLists.length; i++) {
      const listItems = instructionLists[i].querySelectorAll('li')
      if (listItems.length > 1) {
        recipe.instructions = Array.from(listItems).map(item => item.textContent?.trim() || '')
        break
      }
    }
    
    // If still not found, look for paragraphs in sections that might contain instructions
    if (recipe.instructions.length === 0) {
      const instructionSection = Array.from(doc.querySelectorAll('div, section')).find(el => {
        const heading = el.querySelector('h2, h3, h4')
        return heading && /instruction|direction|method|preparation/i.test(heading.textContent || '')
      })
      
      if (instructionSection) {
        const paragraphs = instructionSection.querySelectorAll('p')
        recipe.instructions = Array.from(paragraphs).map(p => p.textContent?.trim() || '').filter(Boolean)
      }
    }
  }

  // Clean up and return the parsed recipe
  recipe.tags = [...new Set(recipe.tags)].filter(Boolean)  // Remove duplicates
  
  console.log('Extracted recipe data:', {
    title: recipe.title,
    ingredients: `Found ${recipe.ingredients.length} ingredients`,
    instructions: `Found ${recipe.instructions.length} instructions`,
    time: recipe.time,
    imageFound: !!recipe.image
  })

  return recipe
}

// Fetch and extract recipe from a URL
async function scrapeRecipe(url: string): Promise<Partial<Recipe>> {
  console.log('Scraping recipe from URL:', url)
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }
    
    const html = await response.text()
    return await extractRecipeData(html, url)
  } catch (error) {
    console.error('Error scraping recipe:', error)
    throw new Error(`Failed to scrape recipe: ${error.message}`)
  }
}

// Main handler for the Deno edge function
Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  
  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const recipeData = await scrapeRecipe(url)
    
    return new Response(JSON.stringify({ success: true, data: recipeData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

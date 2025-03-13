
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
        
        // Extract ingredients
        if (recipeData.recipeIngredient && Array.isArray(recipeData.recipeIngredient)) {
          recipe.ingredients = recipeData.recipeIngredient.map(i => String(i).trim())
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
        
        // Extract cooking time
        if (recipeData.cookTime) {
          const cookTimeMatch = recipeData.cookTime.match(/PT(\d+)M/)
          if (cookTimeMatch && cookTimeMatch[1]) {
            recipe.time = parseInt(cookTimeMatch[1], 10)
          }
        } else if (recipeData.totalTime) {
          const totalTimeMatch = recipeData.totalTime.match(/PT(\d+)M/)
          if (totalTimeMatch && totalTimeMatch[1]) {
            recipe.time = parseInt(totalTimeMatch[1], 10)
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
            ? recipeData.keywords.split(',').map(k => k.trim())
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
  
  // Title fallback
  if (!recipe.title) {
    const titleElement = doc.querySelector('h1')
    if (titleElement) {
      recipe.title = titleElement.textContent?.trim() || ''
    }
  }
  
  // Image fallback
  if (!recipe.image) {
    // Look for the first large image
    const imgElements = doc.querySelectorAll('img')
    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i]
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
  
  // Try to identify ingredients
  if (recipe.ingredients.length === 0) {
    const ingredientLists = doc.querySelectorAll('ul')
    for (let i = 0; i < ingredientLists.length; i++) {
      const listItems = ingredientLists[i].querySelectorAll('li')
      if (listItems.length > 3) {  // Assume a list with at least 3 items could be ingredients
        recipe.ingredients = Array.from(listItems).map(item => item.textContent?.trim() || '')
        break
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

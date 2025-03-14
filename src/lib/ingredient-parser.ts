/**
 * Parses an ingredient string to separate the ingredient name from the amount/unit
 * Example: "500g Chicken Breast" -> { name: "Chicken Breast", amount: "500g" }
 * Example: "2 cups flour" -> { name: "flour", amount: "2 cups" }
 * Example: "1/2 teaspoon salt" -> { name: "salt", amount: "1/2 teaspoon" }
 * Example: "300g/10oz green beans" -> { name: "green beans", amount: "300g/10oz" }
 */
export function parseIngredientAmount(ingredient: string): { name: string; amount: string | null } {
  if (!ingredient || typeof ingredient !== 'string') {
    return { name: ingredient || '', amount: null };
  }

  // Clean up the ingredient string by removing notes in parentheses
  const cleanedIngredient = ingredient.replace(/\([^)]*\)/g, '').trim();
  
  // Dual weight format pattern (e.g., "300g/10oz green beans", "300g / 10oz green beans")
  const dualWeightPattern = /^([\d\/\.\,\s]+(?:g|kg|ml|l|oz|lb)[\s\/]*[\d\/\.\,\s]+(?:g|kg|ml|l|oz|lb))\s+(.+)$/i;
  
  // Common units pattern to match
  const unitsPattern = /^([\d\/\.\,\s]+\s*(?:g|kg|ml|l|oz|lb|pound|pounds|cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|bunch|bunches|clove|cloves|pinch|pinches|handful|handfuls))\s+(.+)$/i;
  
  // Pattern for fractions and numbers at the beginning (e.g., "1/2 onion", "2 eggs")
  const numberPattern = /^([\d\/\.\,\s]+)\s+(.+)$/;
  
  // Pattern for units that come after the amount (e.g., "Chicken Breast 500g")
  const reverseUnitsPattern = /^(.+?)\s+([\d\/\.\,\s]+\s*(?:g|kg|ml|l|oz|lb))$/i;
  
  // Remove trailing brackets and extra spaces
  const withoutTrailingBrackets = cleanedIngredient.replace(/\s*\)\s*$/, '').trim();
  
  // Match for dual weight format like "300g/10oz green beans" or "300g / 10oz green beans"
  const dualWeightMatch = withoutTrailingBrackets.match(dualWeightPattern);
  if (dualWeightMatch) {
    return {
      name: dualWeightMatch[2].trim(),
      amount: dualWeightMatch[1].trim().replace(/\s+\/\s+/g, '/') // Normalize spaces around slash
    };
  }
  
  // Match for units like "500g Chicken Breast"
  const unitsMatch = withoutTrailingBrackets.match(unitsPattern);
  if (unitsMatch) {
    return {
      name: unitsMatch[2].trim(),
      amount: unitsMatch[1].trim()
    };
  }
  
  // Match for units that come after the ingredient like "Chicken Breast 500g"
  const reverseMatch = withoutTrailingBrackets.match(reverseUnitsPattern);
  if (reverseMatch) {
    return {
      name: reverseMatch[1].trim(),
      amount: reverseMatch[2].trim()
    };
  }
  
  // Match for simple numbers like "2 eggs"
  const numberMatch = withoutTrailingBrackets.match(numberPattern);
  if (numberMatch) {
    return {
      name: numberMatch[2].trim(),
      amount: numberMatch[1].trim()
    };
  }
  
  // No amount found
  return {
    name: withoutTrailingBrackets,
    amount: null
  };
}

/**
 * Cleans up an ingredient string by removing notes in parentheses and extra commas
 * Example: "300g / 10oz green beans ((Note 1))" -> "300g / 10oz green beans"
 * Example: "1/2 small onion (, finely chopped (about 1/2 cup))" -> "1/2 small onion, finely chopped"
 */
export function cleanIngredientString(ingredient: string): string {
  if (!ingredient || typeof ingredient !== 'string') {
    return ingredient || '';
  }
  
  // First check for preparation instructions in parentheses and preserve them
  const prepInParentheses = /\((chopped|diced|minced|sliced|grated|peeled|crushed|julienned|cubed|shredded|torn|crumbled|pitted|halved|quartered|finely|roughly|to taste|for garnish)/i;
  if (prepInParentheses.test(ingredient)) {
    // Keep the first set of parentheses that has preparation instructions
    const parenthesesMatch = ingredient.match(/\(([^)]*(?:chopped|diced|minced|sliced|grated|peeled|crushed|julienned|cubed|shredded|torn|crumbled|pitted|halved|quartered|finely|roughly|to taste|for garnish)[^)]*)\)/i);
    if (parenthesesMatch) {
      const prepContent = parenthesesMatch[1].trim();
      
      // Only extract if it doesn't contain measurement notes like "about 1/2 cup"
      if (!/(about|cup|note)/i.test(prepContent)) {
        // Remove all parentheses first
        let cleaned = ingredient.replace(/\([^)]*\)/g, '');
        // Then add back the preparation instruction as a comma-separated clause
        cleaned = cleaned.trim() + ', ' + prepContent;
        // Fix double commas
        cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
        // Remove any trailing commas
        cleaned = cleaned.replace(/,\s*$/, '');
        return cleaned;
      }
    }
  }
  
  // Standard approach for other ingredients
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
  
  // Normalize spaces around slashes in measurements (e.g., "300g / 10oz" -> "300g/10oz")
  cleaned = cleaned.replace(/(\d+\s*(?:g|kg|ml|l|oz|lb))\s*\/\s*(\d+\s*(?:g|kg|ml|l|oz|lb))/gi, '$1/$2');
  
  // Normalize spaces
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Parses an ingredient string to extract preparation instructions
 * Example: "Chicken Breast, diced" -> { mainText: "Chicken Breast", preparation: "diced" }
 * Example: "diced chicken" -> { mainText: "chicken", preparation: "diced" }
 * Example: "blackberries cut up" -> { mainText: "blackberries", preparation: "cut up" }
 * Example: "garlic cloves, finely chopped" -> { mainText: "garlic cloves", preparation: "finely chopped" }
 */
export function parsePreparation(ingredient: string): { mainText: string; preparation: string | null } {
  // Check for empty input
  if (!ingredient || typeof ingredient !== 'string') {
    return { mainText: ingredient || '', preparation: null };
  }
  
  // Common preparation words and phrases that might appear at the beginning or end
  const prepWords = [
    'diced', 'chopped', 'minced', 'sliced', 'grated', 'crushed',
    'peeled', 'julienned', 'cubed', 'shredded', 'torn', 'crumbled',
    'pitted', 'halved', 'quartered', 'whole', 'ground', 'powdered',
    'fresh', 'frozen', 'canned', 'dried', 'cut up', 'cut into pieces',
    'trimmed', 'rinsed', 'washed', 'soaked', 'thawed', 'beaten',
    'melted', 'softened', 'room temperature', 'chilled', 'cooked',
    'boiled', 'fried', 'baked', 'roasted', 'grilled', 'steamed',
    'mashed', 'pureed', 'blended', 'whisked', 'thinly sliced',
    'roughly chopped', 'roughly diced', 'finely diced', 'finely chopped', 
    'finely sliced', 'coarsely chopped', 'thinly sliced', 'coarsely ground',
    'finely minced', 'finely grated', 'lightly beaten', 'well beaten',
    'to serve', 'to garnish', 'to taste', 'for decoration', 'for serving',
    'for garnish'
  ];
  
  // First, check for comma-separated preparation instructions
  // As in "1/2 small onion, finely chopped"
  const commaPattern = /^(.+?),\s*(.+)$/;
  const commaMatch = ingredient.match(commaPattern);
  
  if (commaMatch) {
    const potentialPrep = commaMatch[2].trim();
    
    // Check if what follows the comma is actually a preparation instruction
    // by looking for common preparation words
    for (const prep of prepWords) {
      if (potentialPrep.toLowerCase().includes(prep.toLowerCase())) {
        return {
          mainText: commaMatch[1].trim(),
          preparation: potentialPrep
        };
      }
    }
  }
  
  // Check for multi-word preparation phrases like "cut up", "finely chopped", etc.
  // Sort prepWords by length in descending order to match longest phrases first
  const sortedPrepWords = [...prepWords].sort((a, b) => b.length - a.length);
  
  for (const phrase of sortedPrepWords) {
    // For phrases at the end of ingredient (e.g., "onion finely chopped")
    const phraseRegex = new RegExp(`^(.+?)\\s+(${phrase})$`, 'i');
    const phraseMatch = ingredient.match(phraseRegex);
    
    if (phraseMatch) {
      return {
        mainText: phraseMatch[1].trim(),
        preparation: phrase
      };
    }
    
    // Also check for phrase at beginning (e.g., "finely chopped onion")
    const startPhraseRegex = new RegExp(`^(${phrase})\\s+(.+)$`, 'i');
    const startPhraseMatch = ingredient.match(startPhraseRegex);
    
    if (startPhraseMatch) {
      return {
        mainText: startPhraseMatch[2].trim(),
        preparation: phrase
      };
    }
  }
  
  // No preparation found
  return {
    mainText: ingredient,
    preparation: null
  };
}

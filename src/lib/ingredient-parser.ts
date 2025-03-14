
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
  
  // Enhanced approach: First extract and preserve preparation instructions or measurement notes
  const preserveableContent = [];
  
  // Check for preparation instructions in parentheses and extract them
  const prepInParenthesesRegex = /\(([^)]*(?:chopped|diced|minced|sliced|grated|peeled|crushed|julienned|cubed|shredded|torn|crumbled|pitted|halved|quartered|finely|roughly|to taste|for garnish)[^)]*)\)/gi;
  
  let match;
  let modifiedIngredient = ingredient;
  
  // Extract all preparation instructions from parentheses
  while ((match = prepInParenthesesRegex.exec(ingredient)) !== null) {
    const prepContent = match[1].trim();
    // Only preserve if it doesn't look like measurement notes
    if (!/(about|approximately|approx\.|around|roughly|~)\s+[\d\/]+/.test(prepContent)) {
      preserveableContent.push(prepContent);
    }
  }
  
  // Remove all parentheses content first
  modifiedIngredient = modifiedIngredient.replace(/\([^)]*\)/g, '');
  
  // Clean up commas, spaces, and trailing punctuation
  modifiedIngredient = modifiedIngredient.replace(/\s*,\s*,\s*/g, ',') // Fix double commas
                                         .replace(/\s+/g, ' ') // Normalize spaces
                                         .replace(/,\s*$/, '') // Remove trailing commas
                                         .trim();
  
  // Add preserved preparation instructions back as comma-separated content
  if (preserveableContent.length > 0) {
    // Make sure there's a comma before adding the preparation content
    if (!modifiedIngredient.endsWith(',')) {
      modifiedIngredient += ',';
    }
    
    // Join all preserved prep instructions with commas
    modifiedIngredient += ' ' + preserveableContent.join(', ');
    
    // Fix any resulting double commas again
    modifiedIngredient = modifiedIngredient.replace(/\s*,\s*,\s*/g, ',').trim();
  }
  
  // Normalize spaces around slashes in measurements
  modifiedIngredient = modifiedIngredient.replace(/(\d+\s*(?:g|kg|ml|l|oz|lb))\s*\/\s*(\d+\s*(?:g|kg|ml|l|oz|lb))/gi, '$1/$2');
  
  return modifiedIngredient;
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
  
  // Enhanced list of preparation words and phrases that might appear at the beginning or end
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
    'for garnish', 'at room temperature', 'sifted', 'deveined', 'trimmed',
    'drained', 'rinsed and drained', 'packed', 'loosely packed', 'plus more for garnish',
    'plus extra', 'plus more', 'plus additional', 'divided', 'separated'
  ];
  
  // Check for measurement notes in the preparation instructions
  const measurementPattern = /(about|approximately|approx\.|around|roughly|~)\s+[\d\/]+/i;
  
  // First, check for comma-separated preparation instructions
  // As in "1/2 small onion, finely chopped"
  const commaPattern = /^(.+?),\s*(.+)$/;
  const commaMatch = ingredient.match(commaPattern);
  
  if (commaMatch) {
    const potentialPrep = commaMatch[2].trim();
    
    // Skip if it looks like measurement notes
    if (!measurementPattern.test(potentialPrep)) {
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
  
  // Look for parenthetical notes at the end that might be preparation
  const parentheticalNotePattern = /^(.+?)\s*\(([^)]+)\)$/;
  const parentheticalMatch = ingredient.match(parentheticalNotePattern);
  
  if (parentheticalMatch) {
    const potentialPrep = parentheticalMatch[2].trim();
    
    // Skip if it looks like measurement notes
    if (!measurementPattern.test(potentialPrep)) {
      // Check if what's in parentheses is actually a preparation instruction
      for (const prep of prepWords) {
        if (potentialPrep.toLowerCase().includes(prep.toLowerCase())) {
          return {
            mainText: parentheticalMatch[1].trim(),
            preparation: potentialPrep
          };
        }
      }
    }
  }
  
  // No preparation found
  return {
    mainText: ingredient,
    preparation: null
  };
}

/**
 * Advanced function to extract the most meaningful preparation instructions
 * while filtering out measurement notes
 */
export function extractPreparationInstructions(ingredient: string): string | null {
  if (!ingredient || typeof ingredient !== 'string') {
    return null;
  }
  
  // Common preparation-related phrases 
  const prepPhrases = [
    'chopped', 'diced', 'minced', 'sliced', 'grated', 'peeled', 'crushed',
    'julienned', 'cubed', 'shredded', 'torn', 'crumbled', 'pitted', 'halved',
    'quartered', 'finely', 'roughly', 'coarsely', 'thinly', 'to taste',
    'for garnish', 'at room temperature', 'room temperature', 'thawed', 'drained'
  ];
  
  // Pattern to match measurement notes
  const measurementPattern = /(about|approximately|approx\.|around|roughly|~)\s+[\d\/]+/i;
  
  // Check for explicit preparation instructions after a comma
  const commaPattern = /^.+?,\s*(.+)$/;
  const commaMatch = ingredient.match(commaPattern);
  
  if (commaMatch) {
    const afterComma = commaMatch[1].trim();
    
    // If it contains preparation-related words but not measurement notes
    if (!measurementPattern.test(afterComma) && 
        prepPhrases.some(phrase => afterComma.toLowerCase().includes(phrase))) {
      return afterComma;
    }
  }
  
  // Check for preparation in parentheses
  const parenthesesPattern = /\(([^)]+)\)/g;
  let match;
  
  while ((match = parenthesesPattern.exec(ingredient)) !== null) {
    const content = match[1].trim();
    
    // If it contains preparation-related words but not measurement notes
    if (!measurementPattern.test(content) && 
        prepPhrases.some(phrase => content.toLowerCase().includes(phrase))) {
      return content;
    }
  }
  
  // Use parsePreparation as fallback
  const { preparation } = parsePreparation(ingredient);
  return preparation;
}

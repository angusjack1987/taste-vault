
/**
 * Parses an ingredient string to separate the ingredient name from the amount/unit
 * Example: "500g Chicken Breast" -> { name: "Chicken Breast", amount: "500g" }
 * Example: "2 cups flour" -> { name: "flour", amount: "2 cups" }
 * Example: "1/2 teaspoon salt" -> { name: "salt", amount: "1/2 teaspoon" }
 */
export function parseIngredientAmount(ingredient: string): { name: string; amount: string | null } {
  if (!ingredient || typeof ingredient !== 'string') {
    return { name: ingredient || '', amount: null };
  }

  // Common units pattern to match
  const unitsPattern = /^([\d\/\.\,\s]+\s*(?:g|kg|ml|l|oz|lb|pound|pounds|cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|bunch|bunches|clove|cloves|pinch|pinches|handful|handfuls))\s+(.+)$/i;
  
  // Pattern for fractions and numbers at the beginning (e.g., "1/2 onion", "2 eggs")
  const numberPattern = /^([\d\/\.\,\s]+)\s+(.+)$/;
  
  // Pattern for units that come after the amount (e.g., "Chicken Breast 500g")
  const reverseUnitsPattern = /^(.+?)\s+([\d\/\.\,\s]+\s*(?:g|kg|ml|l|oz|lb))$/i;
  
  // Match for units like "500g Chicken Breast"
  const unitsMatch = ingredient.match(unitsPattern);
  if (unitsMatch) {
    return {
      name: unitsMatch[2].trim(),
      amount: unitsMatch[1].trim()
    };
  }
  
  // Match for units that come after the ingredient like "Chicken Breast 500g"
  const reverseMatch = ingredient.match(reverseUnitsPattern);
  if (reverseMatch) {
    return {
      name: reverseMatch[1].trim(),
      amount: reverseMatch[2].trim()
    };
  }
  
  // Match for simple numbers like "2 eggs"
  const numberMatch = ingredient.match(numberPattern);
  if (numberMatch) {
    return {
      name: numberMatch[2].trim(),
      amount: numberMatch[1].trim()
    };
  }
  
  // No amount found
  return {
    name: ingredient,
    amount: null
  };
}

/**
 * Parses an ingredient string to extract preparation instructions
 * Example: "Chicken Breast, diced" -> { mainText: "Chicken Breast", preparation: "diced" }
 * Example: "diced chicken" -> { mainText: "chicken", preparation: "diced" }
 * Example: "blackberries cut up" -> { mainText: "blackberries", preparation: "cut up" }
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
    'roughly chopped', 'finely diced', 'coarsely ground'
  ];
  
  // Check for "ingredient, preparation" format (e.g., "chicken, diced")
  const commaPattern = /^(.+?),\s*(.+)$/;
  const commaMatch = ingredient.match(commaPattern);
  
  if (commaMatch) {
    return {
      mainText: commaMatch[1].trim(),
      preparation: commaMatch[2].trim()
    };
  }
  
  // Check for multi-word preparation phrases like "cut up", "cut into pieces", etc.
  for (const phrase of prepWords) {
    if (phrase.includes(' ')) {
      // For phrases with spaces like "cut up"
      const phrasePattern = new RegExp(`^(.+?)\\s+(${phrase})$`, 'i');
      const phraseMatch = ingredient.match(phrasePattern);
      
      if (phraseMatch) {
        return {
          mainText: phraseMatch[1].trim(),
          preparation: phrase
        };
      }
      
      // Also check for phrase at beginning
      const startPhrasePattern = new RegExp(`^(${phrase})\\s+(.+)$`, 'i');
      const startPhraseMatch = ingredient.match(startPhrasePattern);
      
      if (startPhraseMatch) {
        return {
          mainText: startPhraseMatch[2].trim(),
          preparation: phrase
        };
      }
    }
  }
  
  // Check for "preparation ingredient" format (e.g., "diced chicken")
  for (const word of prepWords) {
    if (!word.includes(' ')) {  // Skip multi-word phrases as they're handled above
      const wordPattern = new RegExp(`^${word}\\s+(.+)$`, 'i');
      const wordMatch = ingredient.match(wordPattern);
      
      if (wordMatch) {
        return {
          mainText: wordMatch[1].trim(),
          preparation: word
        };
      }
    }
  }
  
  // Check for "ingredient preparation" format (e.g., "chicken diced")
  for (const word of prepWords) {
    if (!word.includes(' ')) {  // Skip multi-word phrases as they're handled above
      const wordPattern = new RegExp(`^(.+?)\\s+${word}$`, 'i');
      const wordMatch = ingredient.match(wordPattern);
      
      if (wordMatch) {
        return {
          mainText: wordMatch[1].trim(),
          preparation: word
        };
      }
    }
  }
  
  // No preparation found
  return {
    mainText: ingredient,
    preparation: null
  };
}

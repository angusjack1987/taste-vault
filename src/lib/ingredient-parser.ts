
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
 */
export function parsePreparation(ingredient: string): { mainText: string; preparation: string | null } {
  const separators = [', ', '; ', ' - ', ' for '];
  let mainText = ingredient;
  let preparation = null;
  
  for (const separator of separators) {
    if (ingredient.includes(separator)) {
      const parts = ingredient.split(new RegExp(`(${separator})`));
      if (parts.length >= 3) {
        mainText = parts[0];
        preparation = parts.slice(2).join('');
        break;
      }
    }
  }
  
  return { mainText, preparation };
}

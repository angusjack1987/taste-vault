
/**
 * Categorizes a food item based on its name
 * @param itemName Name of the food item to categorize
 * @returns The category: 'Freezer', 'Pantry', or 'Fridge' (default)
 */
export const categorizeItem = (itemName: string): string => {
  const name = itemName.toLowerCase();
  
  const freezerItems = [
    'frozen', 'ice', 'popsicle', 'ice cream', 'freezer', 
    'pizza', 'frozen meal', 'fish stick', 'fish fingers', 'frozen vegetable',
    'frozen fruit', 'icecream', 'peas', 'corn', 'berries'
  ];
  
  const pantryItems = [
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'cereal', 'cracker', 'cookie',
    'bean', 'lentil', 'canned', 'jar', 'spice', 'herb', 'oil', 'vinegar',
    'sauce', 'soup', 'mix', 'tea', 'coffee', 'cocoa', 'chocolate', 'snack',
    'chip', 'nut', 'dried', 'grain', 'bread', 'baking'
  ];
  
  for (const freezerItem of freezerItems) {
    if (name.includes(freezerItem)) {
      return 'Freezer';
    }
  }
  
  for (const pantryItem of pantryItems) {
    if (name.includes(pantryItem)) {
      return 'Pantry';
    }
  }
  
  return 'Fridge';
};

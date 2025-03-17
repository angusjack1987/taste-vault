
import React from 'react';
import { Beef, Fish, Apple, Egg, Wheat, Carrot, Utensils } from 'lucide-react';

/**
 * Returns an appropriate icon based on the ingredient name
 * @param ingredientName The ingredient to find an icon for
 * @returns A React element with the appropriate icon
 */
export const getIngredientIcon = (ingredientName: string) => {
  const lowerName = ingredientName.toLowerCase();
  if (/chicken|turkey|beef|meat|steak|pork|lamb|veal/i.test(lowerName)) {
    return <Beef className="h-4 w-4 text-sage-500" />;
  } else if (/fish|salmon|tuna|cod|tilapia|shrimp|prawn|seafood/i.test(lowerName)) {
    return <Fish className="h-4 w-4 text-sage-500" />;
  } else if (/apple|banana|orange|grape|berry|berries|fruit|pear|peach|plum|mango|pineapple|watermelon|melon|kiwi|cherry|cherries|strawberry|blueberry|raspberry|blackberry|blackberries|cherry|cherries/i.test(lowerName)) {
    return <Apple className="h-4 w-4 text-sage-500" />;
  } else if (/egg|eggs/i.test(lowerName)) {
    return <Egg className="h-4 w-4 text-sage-500" />;
  } else if (/flour|bread|rice|pasta|grain|wheat|cereal|oat/i.test(lowerName)) {
    return <Wheat className="h-4 w-4 text-sage-500" />;
  } else if (/carrot|vegetable|tomato|potato|onion|garlic|pepper|cucumber|lettuce/i.test(lowerName)) {
    return <Carrot className="h-4 w-4 text-sage-500" />;
  } else {
    return <Utensils className="h-4 w-4 text-sage-500" />;
  }
};

/**
 * Returns a pastel color class for a tag
 * @param tag The tag to colorize
 * @returns A Tailwind CSS class string for the color
 */
export const getPastelColorForTag = (tag: string): string => {
  const tagLower = tag.toLowerCase();
  if (tagLower.includes('breakfast')) return 'bg-[#FEF7CD] text-black';
  if (tagLower.includes('lunch')) return 'bg-[#D3E4FD] text-black';
  if (tagLower.includes('dinner')) return 'bg-[#E5DEFF] text-black';
  if (tagLower.includes('dessert')) return 'bg-[#FFDEE2] text-black';
  if (tagLower.includes('snack')) return 'bg-[#FDE1D3] text-black';
  if (tagLower.includes('italian')) return 'bg-[#F2FCE2] text-black';
  if (tagLower.includes('mexican')) return 'bg-[#FEC6A1] text-black';
  if (tagLower.includes('asian') || tagLower.includes('chinese') || tagLower.includes('japanese')) return 'bg-[#F2FCE2] text-black';
  if (tagLower.includes('american')) return 'bg-[#FEF7CD] text-black';
  
  const colors = ['bg-[#F2FCE2] text-black', 'bg-[#FEF7CD] text-black', 'bg-[#FEC6A1] text-black', 'bg-[#E5DEFF] text-black', 'bg-[#FFDEE2] text-black', 'bg-[#FDE1D3] text-black', 'bg-[#D3E4FD] text-black'];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

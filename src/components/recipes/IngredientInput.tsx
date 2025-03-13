
import React, { useState } from "react";
import { Carrot, Plus, Scissors, Beef, Fish, Egg, Wheat, Utensils, Apple } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseIngredientAmount } from "@/lib/ingredient-parser";

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ 
  ingredients, 
  onChange, 
  onAdd, 
  onRemove,
  onKeyDown
}) => {
  // Parse the preparation instructions (anything after a comma, semicolon, or "for")
  const parsePreparation = (ingredient: string): { mainText: string; preparation: string | null } => {
    // Common separators for preparation instructions
    const separators = [', ', '; ', ' - ', ' for '];
    let mainText = ingredient;
    let preparation = null;
    
    for (const separator of separators) {
      if (ingredient.includes(separator)) {
        // Fix: Remove the limit parameter from RegExp constructor
        const parts = ingredient.split(new RegExp(`(${separator})`));
        if (parts.length >= 3) {
          mainText = parts[0];
          preparation = parts.slice(2).join('');
          break;
        }
      }
    }
    
    return { mainText, preparation };
  };

  // Function to determine the appropriate icon based on ingredient name
  const getIngredientIcon = (ingredientName: string) => {
    const lowerName = ingredientName.toLowerCase();
    
    if (/chicken|turkey|beef|meat|steak|pork|lamb|veal/i.test(lowerName)) {
      return <Beef className="h-4 w-4 text-sage-500" />;
    } else if (/fish|salmon|tuna|cod|tilapia|shrimp|prawn|seafood/i.test(lowerName)) {
      return <Fish className="h-4 w-4 text-sage-500" />;
    } else if (/apple|banana|orange|grape|berry|berries|fruit|pear|peach|plum|mango|pineapple|watermelon|melon|kiwi|cherry|strawberry|blueberry|raspberry/i.test(lowerName)) {
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

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => {
        const { mainText, preparation } = parsePreparation(ingredient);
        const { name, amount } = parseIngredientAmount(mainText);
        
        // Check if it's the last item (current input)
        const isLastItem = index === ingredients.length - 1;
        
        return (
          <div key={index} className="space-y-1">
            {isLastItem ? (
              // Show input field for the current/last ingredient
              <div className="flex gap-2">
                <Input
                  placeholder={`Ingredient ${index + 1} (e.g., 500g Chicken Breast, diced)`}
                  value={ingredient}
                  onChange={(e) => {
                    const newIngredients = [...ingredients];
                    newIngredients[index] = e.target.value;
                    onChange(newIngredients);
                  }}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemove(index)}
                  disabled={ingredients.length <= 1}
                >
                  <Scissors className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Show parsed details for previous ingredients
              <div className="flex items-center gap-2 p-2 bg-sage-50 rounded-md border border-sage-200">
                <div className="flex-1 flex items-center gap-2">
                  {amount && (
                    <span className="font-mono text-sm">{amount}</span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    {getIngredientIcon(name)}
                    <span className="text-sm">{name}</span>
                  </div>
                  
                  {preparation && (
                    <span className="italic text-sm text-sage-700">{preparation}</span>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  className="h-6 w-6 text-muted-foreground"
                >
                  <Scissors className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Show parsed details for the current/last ingredient */}
            {isLastItem && ingredient && (
              <div className="grid grid-cols-3 gap-2 px-2 mt-1">
                {amount && (
                  <div className="bg-sage-50 rounded-md p-2 text-sm flex items-center border border-sage-200">
                    <span className="font-mono">{amount}</span>
                  </div>
                )}
                
                <div className="bg-sage-50 rounded-md p-2 text-sm flex items-center gap-2 border border-sage-200">
                  {getIngredientIcon(name)}
                  <span>{name}</span>
                </div>
                
                {preparation && (
                  <div className="bg-sage-50 rounded-md p-2 text-sm flex items-center border border-sage-200">
                    <span className="italic text-sage-700">{preparation}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Ingredient
      </Button>
    </div>
  );
};

export default IngredientInput;

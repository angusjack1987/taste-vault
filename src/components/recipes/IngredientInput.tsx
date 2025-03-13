
import React, { useState } from "react";
import { Carrot, Plus, Scissors } from "lucide-react";
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
        const parts = ingredient.split(new RegExp(`(${separator})`, 2));
        if (parts.length >= 3) {
          mainText = parts[0];
          preparation = parts.slice(2).join('');
          break;
        }
      }
    }
    
    return { mainText, preparation };
  };

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => {
        const { mainText, preparation } = parsePreparation(ingredient);
        const { name, amount } = parseIngredientAmount(mainText);
        
        return (
          <div key={index} className="space-y-1">
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
            
            {ingredient && (
              <div className="grid grid-cols-3 gap-2 px-2 mt-1">
                {amount && (
                  <div className="bg-sage-50 rounded-md p-2 text-sm flex items-center border border-sage-200">
                    <span className="font-mono">{amount}</span>
                  </div>
                )}
                
                <div className="bg-sage-50 rounded-md p-2 text-sm flex items-center gap-2 border border-sage-200">
                  <Carrot className="h-4 w-4 text-sage-500" />
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

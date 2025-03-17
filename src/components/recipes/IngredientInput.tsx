import React from "react";
import { Carrot, Plus, Scissors, Beef, Fish, Egg, Wheat, Utensils, Apple } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseIngredientAmount, parsePreparation, cleanIngredientString, extractPreparationInstructions } from "@/lib/ingredient-parser";

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
  const getIngredientIcon = (ingredientName: string) => {
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

  const renderIngredientItem = (ingredient: string, index: number, isInput: boolean) => {
    const cleanedIngredient = cleanIngredientString(ingredient);
    
    // First try to extract direct preparation instructions
    const prepInstructions = extractPreparationInstructions(cleanedIngredient);
    
    // If that doesn't work, fall back to the standard parsing approach
    const { mainText, preparation } = parsePreparation(cleanedIngredient);
    
    // Then parse the amount from the remaining text
    const { name, amount } = parseIngredientAmount(mainText);

    if (isInput) {
      return (
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
      );
    }

    return (
      <div className="flex items-center p-2 bg-sage-50 rounded-md border border-sage-200 hover:bg-sage-100 transition-colors">
        <div className="flex-shrink-0 mr-3">
          {getIngredientIcon(name)}
        </div>
        
        <div className="flex-1">
          <span className="text-sm">
            {amount ? `${amount} ${name}` : name}
            {(prepInstructions || preparation) && (
              <span className="text-xs text-muted-foreground ml-1">
                {prepInstructions || preparation}
              </span>
            )}
          </span>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="flex-shrink-0 h-6 w-6 text-muted-foreground ml-2"
        >
          <Scissors className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderLivePreview = (ingredient: string) => {
    if (!ingredient) return null;
    
    const cleanedIngredient = cleanIngredientString(ingredient);
    console.log(`Live preview for: "${ingredient}" -> cleaned: "${cleanedIngredient}"`);
    
    // First try the enhanced extraction
    const prepInstructions = extractPreparationInstructions(cleanedIngredient);
    
    // Then try the standard approach as fallback
    const { mainText, preparation } = parsePreparation(cleanedIngredient);
    
    // Then parse the amount from the remaining text
    const { name, amount } = parseIngredientAmount(mainText);
    
    console.log(`Parsed preview: name="${name}", amount="${amount}", prep="${prepInstructions || preparation}"`);

    return (
      <div className="p-2 mt-1 border border-sage-200 rounded-md bg-sage-50">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {getIngredientIcon(name)}
          </div>
          
          <div className="flex-1">
            <span className="text-sm">
              {amount ? `${amount} ${name}` : name}
              {(prepInstructions || preparation) && (
                <span className="text-xs text-muted-foreground ml-1">
                  {prepInstructions || preparation}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => {
        const isLastItem = index === ingredients.length - 1;
        
        return (
          <div key={index} className="space-y-1">
            {isLastItem ? 
              renderIngredientItem(ingredient, index, true) : 
              renderIngredientItem(ingredient, index, false)
            }
            
            {isLastItem && ingredient && renderLivePreview(ingredient)}
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

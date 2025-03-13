
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { parseIngredientAmount } from '@/lib/ingredient-parser';
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils";
import AiSuggestionTooltip from '@/components/ui/ai-suggestion-tooltip';

interface IngredientDetailAccordionProps {
  ingredient: string;
  index: number;
  allIngredients: string[];
}

const IngredientDetailAccordion = ({ ingredient, index, allIngredients }: IngredientDetailAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { name, amount } = parseIngredientAmount(ingredient);

  // Generate some example nutritional info based on the ingredient
  const getNutritionalInfo = (ingredientName: string) => {
    // This would ideally come from an API or database
    const nutritionMap: Record<string, any> = {
      chicken: { calories: 165, protein: "31g", fat: "3.6g", carbs: "0g" },
      beef: { calories: 250, protein: "26g", fat: "17g", carbs: "0g" },
      salmon: { calories: 208, protein: "20g", fat: "13g", carbs: "0g" },
      rice: { calories: 130, protein: "2.7g", fat: "0.3g", carbs: "28g" },
      potato: { calories: 77, protein: "2g", fat: "0.1g", carbs: "17g" },
      tomato: { calories: 18, protein: "0.9g", fat: "0.2g", carbs: "3.9g" },
      onion: { calories: 40, protein: "1.1g", fat: "0.1g", carbs: "9.3g" },
      garlic: { calories: 4.5, protein: "0.2g", fat: "0g", carbs: "1g" },
      olive: { calories: 115, protein: "0.8g", fat: "11g", carbs: "6.3g" },
      oil: { calories: 120, protein: "0g", fat: "14g", carbs: "0g" },
      butter: { calories: 102, protein: "0.1g", fat: "11.5g", carbs: "0g" },
      flour: { calories: 364, protein: "10.3g", fat: "1g", carbs: "76.3g" },
      sugar: { calories: 387, protein: "0g", fat: "0g", carbs: "100g" },
      salt: { calories: 0, protein: "0g", fat: "0g", carbs: "0g" },
      pepper: { calories: 2, protein: "0.1g", fat: "0g", carbs: "0.6g" },
      egg: { calories: 155, protein: "12.6g", fat: "10.6g", carbs: "1.1g" },
      milk: { calories: 42, protein: "3.4g", fat: "1g", carbs: "5g" },
      cheese: { calories: 402, protein: "25g", fat: "33g", carbs: "1.3g" },
      broccoli: { calories: 55, protein: "3.7g", fat: "0.6g", carbs: "11.2g" },
      spinach: { calories: 23, protein: "2.9g", fat: "0.4g", carbs: "3.6g" },
      carrot: { calories: 41, protein: "0.9g", fat: "0.2g", carbs: "10g" },
    };

    // Look for keywords in the ingredient name
    for (const [key, value] of Object.entries(nutritionMap)) {
      if (ingredientName.toLowerCase().includes(key)) {
        return value;
      }
    }

    // Default values if no match is found
    return { calories: 50, protein: "1g", fat: "0.5g", carbs: "5g" };
  };

  // Get substitutions based on the ingredient name
  const getSubstitutions = (ingredientName: string) => {
    const substitutionMap: Record<string, string[]> = {
      chicken: ["tofu", "tempeh", "seitan", "chickpeas"],
      beef: ["mushrooms", "lentils", "beans", "plant-based ground"],
      salmon: ["tuna", "trout", "tofu", "tempeh"],
      rice: ["quinoa", "cauliflower rice", "bulgur", "barley"],
      potato: ["sweet potato", "cauliflower", "turnips", "parsnips"],
      flour: ["almond flour", "coconut flour", "oat flour", "gluten-free blend"],
      sugar: ["honey", "maple syrup", "coconut sugar", "stevia"],
      milk: ["almond milk", "oat milk", "soy milk", "coconut milk"],
      butter: ["olive oil", "coconut oil", "avocado", "nut butters"],
      egg: ["flax egg", "chia egg", "applesauce", "silken tofu"],
    };

    for (const [key, value] of Object.entries(substitutionMap)) {
      if (ingredientName.toLowerCase().includes(key)) {
        return value;
      }
    }

    return ["No common substitutions found"];
  };

  const nutrition = getNutritionalInfo(name);
  const substitutions = getSubstitutions(name);
  const pairsWellWith = allIngredients
    .filter(ing => ing !== ingredient)
    .map(ing => parseIngredientAmount(ing).name.split(" ").pop())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-1 mb-2"
    >
      <CollapsibleTrigger className="flex w-full items-center text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Info className="h-3 w-3 mr-1 text-purple-400" />
        <span className="mr-1">Details</span>
        {isOpen ? 
          <ChevronUp className="h-3 w-3 transition-transform duration-300" /> : 
          <ChevronDown className="h-3 w-3 transition-transform duration-300" />
        }
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 py-2 text-xs bg-purple-50 rounded-md mt-1 border border-purple-100">
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1">Nutritional Info (per 100g)</Label>
            <div className="grid grid-cols-4 gap-1 mt-1">
              <div className="bg-white p-1.5 rounded text-center">
                <div className="font-semibold text-purple-700">{nutrition.calories}</div>
                <div className="text-[10px] text-muted-foreground">Calories</div>
              </div>
              <div className="bg-white p-1.5 rounded text-center">
                <div className="font-semibold text-purple-700">{nutrition.protein}</div>
                <div className="text-[10px] text-muted-foreground">Protein</div>
              </div>
              <div className="bg-white p-1.5 rounded text-center">
                <div className="font-semibold text-purple-700">{nutrition.fat}</div>
                <div className="text-[10px] text-muted-foreground">Fat</div>
              </div>
              <div className="bg-white p-1.5 rounded text-center">
                <div className="font-semibold text-purple-700">{nutrition.carbs}</div>
                <div className="text-[10px] text-muted-foreground">Carbs</div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1">Possible Substitutions</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {substitutions.map((sub, i) => (
                <div 
                  key={i}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px]",
                    "bg-white border border-purple-100 text-purple-700"
                  )}
                >
                  {sub}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1">Pairs Well With</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {pairsWellWith.map((pair, i) => (
                <div 
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-purple-100 text-purple-700"
                >
                  {pair}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-2 rounded border border-purple-100">
            <AiSuggestionTooltip content="Information provided by AI and may not be 100% accurate">
              <div className="flex items-center text-[10px] text-muted-foreground italic">
                <Info className="h-3 w-3 mr-1 text-purple-400" />
                Tap for info about data accuracy
              </div>
            </AiSuggestionTooltip>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default IngredientDetailAccordion;

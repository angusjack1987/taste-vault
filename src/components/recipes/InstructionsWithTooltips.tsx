
import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InstructionsWithTooltipsProps {
  instructions: string[];
  ingredients: string[];
}

const InstructionsWithTooltips: React.FC<InstructionsWithTooltipsProps> = ({
  instructions,
  ingredients,
}) => {
  // Function to find ingredients in instruction text with improved algorithm
  const findIngredientMatches = (text: string) => {
    // Create a map to store matches
    const matches: Array<{
      ingredient: string;
      index: number;
      length: number;
    }> = [];

    // Sort ingredients by length (descending) to match longest ingredients first
    const sortedIngredients = [...ingredients].sort(
      (a, b) => b.length - a.length
    );

    // Process ingredients to create a more comprehensive matching system
    const ingredientKeywords = sortedIngredients.map((ingredient) => {
      // Extract the main ingredient name without quantity and preparation
      const mainName = ingredient
        .replace(/^\d+\/\d+|\d+(\.\d+)?/g, "") // Remove fractions and decimals
        .replace(/(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|g|kg|ml|l|oz|lb)/gi, "") // Remove units
        .replace(/^\s+|\s+$|\s+,/g, "") // Trim whitespace
        .split(",")[0] // Get first part before any comma
        .split("(")[0] // Remove anything in parentheses
        .trim();

      // Also extract potential cooking techniques or preparations
      const preparations = ingredient.match(/(diced|chopped|minced|sliced|grated|julienned|cubed|crushed)/gi) || [];
      
      // Get specific ingredient forms that might be referenced
      const forms = [];
      if (ingredient.toLowerCase().includes("sauce") || 
          ingredient.toLowerCase().includes("dressing") ||
          ingredient.toLowerCase().includes("marinade")) {
        forms.push(
          "sauce", 
          "dressing", 
          "marinade",
          "mixture"
        );
      }

      return {
        fullIngredient: ingredient,
        mainName,
        preparations,
        forms
      };
    });

    // For each instruction, use more sophisticated pattern matching
    let lowerText = text.toLowerCase();
    
    ingredientKeywords.forEach((ingredientInfo) => {
      const { fullIngredient, mainName, preparations, forms } = ingredientInfo;
      
      if (mainName.length < 3) return; // Skip very short ingredients
      
      // Check for the main ingredient name
      const mainRegex = new RegExp(`\\b${mainName}\\b`, "gi");
      let match;
      
      // Find all matches of the main ingredient name
      while ((match = mainRegex.exec(text)) !== null) {
        matches.push({
          ingredient: fullIngredient,
          index: match.index,
          length: match[0].length,
        });
      }
      
      // Check for forms (sauce, dressing, etc.)
      forms.forEach(form => {
        if (form.length < 3) return;
        
        // Custom logic for specific forms that might represent the ingredient
        const formRegex = new RegExp(`\\b${form}\\b`, "gi");
        let matchItem; // Changed from 'match' to 'matchItem'
        
        while ((matchItem = formRegex.exec(text)) !== null) { // Changed from 'match' to 'matchItem'
          // Only add if this section of text likely refers to the ingredient
          // by checking nearby words
          const contextStart = Math.max(0, matchItem.index - 30); // Changed from 'match.index' to 'matchItem.index'
          const contextEnd = Math.min(text.length, matchItem.index + form.length + 30); // Changed from 'match.index' to 'matchItem.index'
          const context = text.substring(contextStart, contextEnd).toLowerCase();
          
          if (context.includes(mainName.toLowerCase())) {
            matches.push({
              ingredient: fullIngredient,
              index: matchItem.index, // Changed from 'match.index' to 'matchItem.index'
              length: matchItem[0].length, // Changed from 'match[0].length' to 'matchItem[0].length'
            });
          }
        }
      });

      // Check for preparations in context
      preparations.forEach(prep => {
        if (!prep || prep.length < 4) return;
        
        const prepRegex = new RegExp(`\\b${prep}\\b`, "gi");
        let matchPrep; // Changed from 'match' to 'matchPrep'
        
        while ((matchPrep = prepRegex.exec(text)) !== null) { // Changed from 'match' to 'matchPrep'
          // Check if the ingredient name is mentioned nearby
          const contextStart = Math.max(0, matchPrep.index - 20); // Changed from 'match.index' to 'matchPrep.index'
          const contextEnd = Math.min(text.length, matchPrep.index + prep.length + 20); // Changed from 'match.index' to 'matchPrep.index'
          const context = text.substring(contextStart, contextEnd).toLowerCase();
          
          if (context.includes(mainName.toLowerCase())) {
            matches.push({
              ingredient: fullIngredient,
              index: matchPrep.index, // Changed from 'match.index' to 'matchPrep.index'
              length: matchPrep[0].length, // Changed from 'match[0].length' to 'matchPrep[0].length'
            });
          }
        }
      });
    });

    // Look for cooking techniques that would benefit from ingredient tooltips
    const techniquesToMatch = [
      "mix", "combine", "stir", "whisk", "blend", "fold", "add", 
      "pour", "drizzle", "sprinkle", "top with", "garnish with"
    ];
    
    techniquesToMatch.forEach(technique => {
      const techniqueRegex = new RegExp(`\\b${technique}\\b`, "gi");
      let matchTech; // Changed from 'match' to 'matchTech'
      
      while ((matchTech = techniqueRegex.exec(text)) !== null) { // Changed from 'match' to 'matchTech'
        // Find which ingredients this technique might apply to
        const contextEnd = Math.min(text.length, matchTech.index + technique.length + 40); // Changed from 'match.index' to 'matchTech.index'
        const forwardContext = text.substring(matchTech.index, contextEnd).toLowerCase(); // Changed from 'match.index' to 'matchTech.index'
        
        ingredientKeywords.forEach(({ fullIngredient, mainName }) => {
          if (mainName.length < 3) return;
          
          if (forwardContext.includes(mainName.toLowerCase())) {
            matches.push({
              ingredient: fullIngredient,
              index: matchTech.index, // Changed from 'match.index' to 'matchTech.index'
              length: technique.length,
            });
          }
        });
      }
    });

    // Sort matches by index and remove overlaps
    const filteredMatches = matches
      .sort((a, b) => a.index - b.index)
      .filter((match, i, arr) => {
        if (i === 0) return true;
        const prevMatch = arr[i - 1];
        // Prevent overlapping matches
        return match.index >= prevMatch.index + prevMatch.length;
      });

    return filteredMatches;
  };

  // Function to render text with tooltips
  const renderTextWithTooltips = (text: string, ingredientMatches: Array<any>) => {
    if (ingredientMatches.length === 0) {
      return text;
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    ingredientMatches.forEach((match, i) => {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(text.substring(lastIndex, match.index));
      }

      // Add the match with tooltip
      const matchedText = text.substr(match.index, match.length);
      result.push(
        <TooltipProvider key={`tooltip-${i}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help border-dotted border-b border-primary text-primary">
                {matchedText}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-primary" />
                <p className="text-sm">{match.ingredient}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = match.index + match.length;
    });

    // Add text after the last match
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return <>{result}</>;
  };

  return (
    <ol className="space-y-4 text-xs sm:text-sm">
      {instructions.map((step, index) => {
        const matches = findIngredientMatches(step);
        return (
          <li key={index} className="flex gap-3">
            <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
              {index + 1}
            </span>
            <span>{renderTextWithTooltips(step, matches)}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default InstructionsWithTooltips;

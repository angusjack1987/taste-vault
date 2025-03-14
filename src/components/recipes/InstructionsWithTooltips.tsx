import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AiSuggestionTooltip from "@/components/ui/ai-suggestion-tooltip";

interface InstructionsWithTooltipsProps {
  instructions: string[];
  ingredients: string[];
  enhancedInstructions?: {
    step: string;
    tooltips: Array<{
      text: string;
      ingredient: string;
      explanation?: string;
    }>;
  }[];
  isEnhanced?: boolean;
}

const InstructionsWithTooltips: React.FC<InstructionsWithTooltipsProps> = ({
  instructions,
  ingredients,
  enhancedInstructions,
  isEnhanced = false,
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
        let matchItem;
        
        while ((matchItem = formRegex.exec(text)) !== null) {
          // Only add if this section of text likely refers to the ingredient
          // by checking nearby words
          const contextStart = Math.max(0, matchItem.index - 30);
          const contextEnd = Math.min(text.length, matchItem.index + form.length + 30);
          const context = text.substring(contextStart, contextEnd).toLowerCase();
          
          if (context.includes(mainName.toLowerCase())) {
            matches.push({
              ingredient: fullIngredient,
              index: matchItem.index,
              length: matchItem[0].length,
            });
          }
        }
      });

      // Check for preparations in context
      preparations.forEach(prep => {
        if (!prep || prep.length < 4) return;
        
        const prepRegex = new RegExp(`\\b${prep}\\b`, "gi");
        let matchPrep;
        
        while ((matchPrep = prepRegex.exec(text)) !== null) {
          // Check if the ingredient name is mentioned nearby
          const contextStart = Math.max(0, matchPrep.index - 20);
          const contextEnd = Math.min(text.length, matchPrep.index + prep.length + 20);
          const context = text.substring(contextStart, contextEnd).toLowerCase();
          
          if (context.includes(mainName.toLowerCase())) {
            matches.push({
              ingredient: fullIngredient,
              index: matchPrep.index,
              length: matchPrep[0].length,
            });
          }
        }
      });
    });

    // Look for composite ingredients that might be referred to in the instructions
    const compositeTerms = [
      "dressing", "sauce", "marinade", "mixture", "seasoning", "spice mix"
    ];
    
    compositeTerms.forEach(term => {
      const termRegex = new RegExp(`\\b${term}\\b`, "gi");
      let matchTerm;
      
      while ((matchTerm = termRegex.exec(text)) !== null) {
        // Find related ingredients for this composite term
        const relatedIngredients = ingredients.filter(ing => 
          ing.toLowerCase().includes(term) || 
          // Also check if any ingredient is specifically for this composite
          ing.toLowerCase().includes(`for ${term}`) ||
          ing.toLowerCase().includes(`${term} ingredient`)
        );
        
        if (relatedIngredients.length > 0) {
          matches.push({
            ingredient: `${term.charAt(0).toUpperCase() + term.slice(1)} (${relatedIngredients.join(", ")})`,
            index: matchTerm.index,
            length: matchTerm[0].length,
          });
        }
      }
    });

    // Sort matches by index to maintain correct text order
    return matches.sort((a, b) => a.index - b.index);
  };

  // Function to render text with tooltips
  const renderTextWithTooltips = (text: string, ingredientMatches: Array<any>) => {
    if (ingredientMatches.length === 0) {
      return text;
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    // Function to check if matches overlap
    const isOverlapping = (match1: any, match2: any) => {
      return match1.index < match2.index + match2.length && 
             match2.index < match1.index + match1.length;
    };

    // Filter out overlapping matches
    const filteredMatches = ingredientMatches.filter((match, i) => {
      for (let j = 0; j < i; j++) {
        if (isOverlapping(match, ingredientMatches[j])) {
          return false;
        }
      }
      return true;
    });

    filteredMatches.forEach((match, i) => {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(text.substring(lastIndex, match.index));
      }

      // Add the match with tooltip using AiSuggestionTooltip
      const matchedText = text.substr(match.index, match.length);
      result.push(
        <AiSuggestionTooltip key={`tooltip-${i}`} content={match.ingredient}>
          <span className="text-sunshine-600 font-medium border-b border-dotted border-sunshine-400">
            {matchedText}
          </span>
        </AiSuggestionTooltip>
      );

      lastIndex = match.index + match.length;
    });

    // Add text after the last match
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return <>{result}</>;
  };

  // Render enhanced instructions if available
  const renderEnhancedInstructions = () => {
    return enhancedInstructions?.map((step, index) => {
      const result: React.ReactNode[] = [];
      let currentText = step.step;
      let lastIndex = 0;

      // Process all tooltips for this step
      if (step.tooltips && step.tooltips.length > 0) {
        // Create a data structure similar to ingredient matches
        const tooltipMatches = step.tooltips.map(tooltip => ({
          text: tooltip.text,
          ingredient: tooltip.ingredient,
          explanation: tooltip.explanation,
          index: currentText.toLowerCase().indexOf(tooltip.text.toLowerCase()),
          length: tooltip.text.length
        }))
        .filter(match => match.index !== -1) // Filter out tooltips that don't match
        .sort((a, b) => a.index - b.index); // Sort by position in text

        // Function to check if tooltips overlap
        const isOverlapping = (match1: any, match2: any) => {
          return match1.index < match2.index + match2.length && 
                match2.index < match1.index + match1.length;
        };

        // Filter out overlapping tooltips
        const filteredTooltips = tooltipMatches.filter((match, i) => {
          for (let j = 0; j < i; j++) {
            if (isOverlapping(match, tooltipMatches[j])) {
              return false;
            }
          }
          return true;
        });

        filteredTooltips.forEach((tooltip, tooltipIndex) => {
          // Add text before the tooltip
          if (tooltip.index > lastIndex) {
            result.push(currentText.substring(lastIndex, tooltip.index));
          }

          // Add the tooltip with AiSuggestionTooltip
          const tooltipText = currentText.substr(tooltip.index, tooltip.length);
          result.push(
            <AiSuggestionTooltip key={`enhanced-tooltip-${index}-${tooltipIndex}`} content={tooltip.ingredient}>
              <span className="text-sunshine-600 font-medium border-b border-dotted border-sunshine-400">
                {tooltipText}
              </span>
            </AiSuggestionTooltip>
          );

          lastIndex = tooltip.index + tooltip.length;
        });
      }

      // Add text after the last tooltip (or all text if no tooltip was found)
      if (lastIndex < currentText.length) {
        result.push(currentText.substring(lastIndex));
      }

      return (
        <li key={index} className="flex gap-3 mb-4">
          <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
            {index + 1}
          </span>
          <span className="text-xs sm:text-sm">{result.length > 0 ? result : currentText}</span>
        </li>
      );
    });
  };

  return (
    <ol className="space-y-4">
      {isEnhanced && enhancedInstructions ? (
        renderEnhancedInstructions()
      ) : (
        instructions.map((step, index) => {
          // Get all matches per instruction (no longer limited to one)
          const matches = findIngredientMatches(step);
          return (
            <li key={index} className="flex gap-3 mb-4">
              <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <span className="text-xs sm:text-sm">{renderTextWithTooltips(step, matches)}</span>
            </li>
          );
        })
      )}
    </ol>
  );
};

export default InstructionsWithTooltips;

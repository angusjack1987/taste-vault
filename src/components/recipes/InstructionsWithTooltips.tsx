
import React from "react";
import AiSuggestionTooltip from "@/components/ui/ai-suggestion-tooltip";
import { parseIngredientAmount, parsePreparation, cleanIngredientString } from "@/lib/ingredient-parser";

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
  // Process ingredients to extract amounts and preparations for enhanced tooltips
  const processedIngredients = ingredients.map(ingredient => {
    const cleanedIngredient = cleanIngredientString(ingredient);
    const { mainText, preparation } = parsePreparation(cleanedIngredient);
    const { name, amount } = parseIngredientAmount(mainText);
    
    return {
      fullText: ingredient,
      name,
      amount,
      preparation,
      cleanedName: name.toLowerCase().trim(),
    };
  });

  // Improved function to find ingredients in instruction text
  const findIngredientMatches = (text: string) => {
    // Create a map to store matches
    const matches: Array<{
      ingredient: string;
      index: number;
      length: number;
      amount?: string;
      preparation?: string;
    }> = [];

    // Sort ingredients by length (descending) to match longest ingredients first
    const sortedIngredients = [...processedIngredients].sort(
      (a, b) => b.name.length - a.name.length
    );

    // Better ingredient processing for more comprehensive matching
    const ingredientKeywords = sortedIngredients.map((ingredient) => {
      // Extract the main ingredient name without quantity and preparation
      const mainName = ingredient.name
        .replace(/^\d+\/\d+|\d+(\.\d+)?/g, "") // Remove fractions and decimals
        .replace(/(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|g|kg|ml|l|oz|lb)/gi, "") // Remove units
        .replace(/^\s+|\s+$|\s+,/g, "") // Trim whitespace
        .split(",")[0] // Get first part before any comma
        .split("(")[0] // Remove anything in parentheses
        .trim();

      // Also extract potential cooking techniques or preparations
      const preparations = ingredient.preparation ? 
        [ingredient.preparation] : 
        ingredient.fullText.match(/(diced|chopped|minced|sliced|grated|julienned|cubed|crushed)/gi) || [];
      
      // Get specific ingredient forms that might be referenced
      const forms = [];
      if (ingredient.fullText.toLowerCase().includes("sauce") || 
          ingredient.fullText.toLowerCase().includes("dressing") ||
          ingredient.fullText.toLowerCase().includes("marinade")) {
        forms.push(
          "sauce", 
          "dressing", 
          "marinade",
          "mixture"
        );
      }

      return {
        fullIngredient: ingredient.fullText,
        mainName,
        preparations,
        forms,
        amount: ingredient.amount,
        preparation: ingredient.preparation
      };
    });

    // For each instruction, use more sophisticated pattern matching
    let lowerText = text.toLowerCase();
    
    ingredientKeywords.forEach((ingredientInfo) => {
      const { fullIngredient, mainName, preparations, forms, amount, preparation } = ingredientInfo;
      
      if (mainName.length < 3) return; // Skip very short ingredients
      
      // Match the main ingredient name
      const mainNameWords = mainName.toLowerCase().split(/\s+/);
      
      // If the main name has multiple words, check for each word and also the full phrase
      if (mainNameWords.length > 1) {
        // Check for the full phrase
        const fullNameRegex = new RegExp(`\\b${mainName.replace(/\s+/g, '\\s+')}\\b`, "gi");
        let fullMatch;
        
        while ((fullMatch = fullNameRegex.exec(text)) !== null) {
          const tooltipText = `${amount ? amount + ' ' : ''}${mainName}${preparation ? ' (' + preparation + ')' : ''}`;
          matches.push({
            ingredient: tooltipText,
            index: fullMatch.index,
            length: fullMatch[0].length,
            amount,
            preparation
          });
        }
        
        // Also check for key words in the ingredient name
        mainNameWords.forEach(word => {
          if (word.length < 3) return; // Skip very short words
          
          const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
          let wordMatch;
          
          while ((wordMatch = wordRegex.exec(text)) !== null) {
            // Only add if we don't already have a match at this position
            const alreadyMatched = matches.some(m => 
              (wordMatch.index >= m.index && wordMatch.index < m.index + m.length) ||
              (wordMatch.index + word.length > m.index && wordMatch.index < m.index)
            );
            
            if (!alreadyMatched) {
              const tooltipText = `${amount ? amount + ' ' : ''}${mainName}${preparation ? ' (' + preparation + ')' : ''}`;
              matches.push({
                ingredient: tooltipText,
                index: wordMatch.index,
                length: wordMatch[0].length,
                amount,
                preparation
              });
            }
          }
        });
      } else {
        // For single word ingredients
        const mainRegex = new RegExp(`\\b${mainName}\\b`, "gi");
        let match;
        
        while ((match = mainRegex.exec(text)) !== null) {
          const tooltipText = `${amount ? amount + ' ' : ''}${mainName}${preparation ? ' (' + preparation + ')' : ''}`;
          matches.push({
            ingredient: tooltipText,
            index: match.index,
            length: match[0].length,
            amount,
            preparation
          });
        }
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
            const tooltipText = `${amount ? amount + ' ' : ''}${mainName}${preparation ? ' (' + preparation + ')' : ''}`;
            matches.push({
              ingredient: tooltipText,
              index: matchItem.index,
              length: matchItem[0].length,
              amount,
              preparation
            });
          }
        }
      });

      // Check for preparations that might indicate the ingredient
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
            // Don't add prep words as separate matches if they're close to the main ingredient
            const alreadyMatched = matches.some(m => 
              Math.abs(matchPrep.index - m.index) < 15 && 
              context.indexOf(mainName.toLowerCase()) < 15
            );
            
            if (!alreadyMatched) {
              const tooltipText = `${amount ? amount + ' ' : ''}${mainName}${preparation ? ' (' + preparation + ')' : ''}`;
              matches.push({
                ingredient: tooltipText,
                index: matchPrep.index,
                length: matchPrep[0].length,
                amount,
                preparation
              });
            }
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
        const relatedIngredients = processedIngredients.filter(ing => 
          ing.fullText.toLowerCase().includes(term) || 
          // Also check if any ingredient is specifically for this composite
          ing.fullText.toLowerCase().includes(`for ${term}`) ||
          ing.fullText.toLowerCase().includes(`${term} ingredient`)
        );
        
        if (relatedIngredients.length > 0) {
          const ingredientList = relatedIngredients.map(ing => 
            `${ing.amount ? ing.amount + ' ' : ''}${ing.name}${ing.preparation ? ' (' + ing.preparation + ')' : ''}`
          ).join(", ");
          
          matches.push({
            ingredient: `${term.charAt(0).toUpperCase() + term.slice(1)}: ${ingredientList}`,
            index: matchTerm.index,
            length: matchTerm[0].length
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

      // If the step doesn't have explicit tooltips, find ingredients automatically
      let tooltipsToUse = step.tooltips;
      if (!tooltipsToUse || tooltipsToUse.length === 0) {
        const autoMatches = findIngredientMatches(step.step);
        tooltipsToUse = autoMatches.map(match => ({
          text: match.ingredient,
          ingredient: match.ingredient,
          index: match.index,
          length: match.length
        }));
      }

      // Process all tooltips for this step
      if (tooltipsToUse && tooltipsToUse.length > 0) {
        // Create a data structure similar to ingredient matches
        const tooltipMatches = tooltipsToUse.map(tooltip => {
          // Find the position of the tooltip text in the step
          let tooltipTextLower = tooltip.text.toLowerCase();
          let textIndex = currentText.toLowerCase().indexOf(tooltipTextLower);
          
          // If direct match not found, try to find a partial match
          if (textIndex === -1 && tooltip.text.length > 4) {
            // Try with first few words
            const firstWords = tooltip.text.split(' ').slice(0, 2).join(' ');
            if (firstWords.length > 3) {
              textIndex = currentText.toLowerCase().indexOf(firstWords.toLowerCase());
            }
          }
          
          // If still not found, look for ingredient name
          if (textIndex === -1) {
            // Find any ingredient in the step that matches the tooltip
            const ingredientName = tooltip.ingredient.split(' ')[0]; // Get first word of ingredient
            if (ingredientName && ingredientName.length > 3) {
              const ingredientRegex = new RegExp(`\\b${ingredientName}\\b`, 'gi');
              const match = ingredientRegex.exec(currentText);
              if (match) {
                textIndex = match.index;
                return {
                  text: match[0],
                  ingredient: tooltip.ingredient,
                  explanation: tooltip.explanation,
                  index: textIndex,
                  length: match[0].length
                };
              }
            }
          }
          
          // Return the tooltip match if found
          if (textIndex !== -1) {
            return {
              text: currentText.substr(textIndex, tooltip.text.length),
              ingredient: tooltip.ingredient,
              explanation: tooltip.explanation,
              index: textIndex,
              length: tooltip.text.length
            };
          }
          
          // If no match found, return null
          return null;
        })
        .filter(match => match !== null) // Filter out tooltips that don't match
        .sort((a, b) => a!.index - b!.index); // Sort by position in text

        // Function to check if tooltips overlap
        const isOverlapping = (match1: any, match2: any) => {
          return match1.index < match2.index + match2.length && 
                match2.index < match1.index + match1.length;
        };

        // Filter out overlapping tooltips
        const filteredTooltips = tooltipMatches.filter((match, i) => {
          if (!match) return false;
          for (let j = 0; j < i; j++) {
            if (tooltipMatches[j] && isOverlapping(match, tooltipMatches[j])) {
              return false;
            }
          }
          return true;
        });

        filteredTooltips.forEach((tooltip, tooltipIndex) => {
          if (!tooltip) return;
          
          // Add text before the tooltip
          if (tooltip.index > lastIndex) {
            result.push(currentText.substring(lastIndex, tooltip.index));
          }

          // Add the tooltip with AiSuggestionTooltip
          const tooltipText = currentText.substr(tooltip.index, tooltip.length);
          const tooltipContent = tooltip.explanation 
            ? `${tooltip.ingredient}: ${tooltip.explanation}`
            : tooltip.ingredient;
            
          result.push(
            <AiSuggestionTooltip key={`enhanced-tooltip-${index}-${tooltipIndex}`} content={tooltipContent}>
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

  // If enhanced instructions not available, find ingredients automatically
  const renderRegularInstructions = () => {
    return instructions.map((step, index) => {
      // Find all ingredient matches in this instruction
      const matches = findIngredientMatches(step);
      return (
        <li key={index} className="flex gap-3 mb-4">
          <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
            {index + 1}
          </span>
          <span className="text-xs sm:text-sm">{renderTextWithTooltips(step, matches)}</span>
        </li>
      );
    });
  };

  return (
    <ol className="space-y-4">
      {isEnhanced && enhancedInstructions && enhancedInstructions.length > 0 ? 
        renderEnhancedInstructions() : 
        renderRegularInstructions()
      }
    </ol>
  );
};

export default InstructionsWithTooltips;


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
  // Function to find ingredients in instruction text
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

    // For each ingredient, find all occurrences in the text
    sortedIngredients.forEach((ingredient) => {
      // Extract the main ingredient name without quantity and preparation
      const ingredientName = ingredient
        .replace(/^\d+\/\d+|\d+(\.\d+)?/g, "") // Remove fractions and decimals
        .replace(/(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|g|kg|ml|l|oz|lb)/gi, "") // Remove units
        .replace(/^\s+|\s+$|\s+,/g, "") // Trim whitespace
        .split(",")[0] // Get first part before any comma
        .split("(")[0] // Remove anything in parentheses
        .trim();

      if (ingredientName.length < 3) return; // Skip very short ingredients

      // Create a regex that matches the ingredient name with word boundaries
      // Use case insensitive flag and word boundaries
      const regex = new RegExp(`\\b${ingredientName}\\b`, "gi");
      let match;

      // Find all matches in the text
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          ingredient,
          index: match.index,
          length: match[0].length,
        });
      }
    });

    // Sort matches by index
    return matches.sort((a, b) => a.index - b.index);
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
    <ol className="space-y-4">
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

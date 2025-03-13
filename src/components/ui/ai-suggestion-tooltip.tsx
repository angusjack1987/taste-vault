
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

interface AiSuggestionTooltipProps {
  children: React.ReactNode;
  content: string;
}

const AiSuggestionTooltip = ({ children, content }: AiSuggestionTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent 
          className="bg-gradient-to-r from-purple-500/95 to-indigo-600/95 text-white border-none p-3 max-w-xs"
          sideOffset={5}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 text-yellow-300" />
            <p>{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AiSuggestionTooltip;


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
          className="bg-secondary border-2 border-lemon-600 p-3 max-w-xs rounded-xl shadow-lg"
          sideOffset={5}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 text-primary animate-pulse" />
            <p className="text-secondary-foreground text-sm font-medium">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AiSuggestionTooltip;

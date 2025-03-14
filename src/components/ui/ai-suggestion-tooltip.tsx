
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AiSuggestionTooltipProps {
  children: React.ReactNode;
  content: string;
}

const AiSuggestionTooltip = ({ children, content }: AiSuggestionTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger className="cursor-pointer inline-flex touch-manipulation" asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white rounded-full py-1 px-3 border border-sunshine-200 z-50 max-w-[250px] sm:max-w-xs"
          sideOffset={5}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-sunshine-100 flex items-center justify-center">
              <span className="text-sunshine-600 text-xs font-medium">i</span>
            </div>
            <p className="text-sm">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AiSuggestionTooltip;

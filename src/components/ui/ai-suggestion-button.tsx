
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSuggestionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xs" | "xl";
  isLoading?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "clean" | "menu" | "tomato" | "lettuce" | "cheese" | "bread" | "blueberry" | "grape" | "orange" | "mint";
}

const AiSuggestionButton = ({
  onClick,
  label = "AI Suggestions",
  className,
  size = "default",
  isLoading = false,
  children,
  variant = "cheese",
}: AiSuggestionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "ai-suggestion-button relative overflow-hidden font-medium uppercase bg-white border-2 border-black rounded-xl",
        "transition-all active:translate-x-0 active:translate-y-0 active:shadow-none",
        "before:content-[''] before:absolute before:-z-10 before:top-2 before:left-2 before:w-full before:h-full before:bg-black before:rounded-xl before:star-shape",
        className
      )}
      size={size}
      disabled={isLoading}
      variant={variant}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <div className="absolute -top-2 -right-3 w-3 h-3 bg-yellow-300 border border-black rounded-full animate-neo-pulse opacity-60" />
            <div className="absolute -bottom-2 -left-3 w-3 h-3 bg-blue-300 border border-black rounded-full animate-neo-float opacity-60" />
          </div>
          <span className="animate-pulse">Processing...</span>
        </div>
      ) : (
        children || (
          <>
            <Sparkles className="h-4 w-4 mr-2 animate-neo-pulse" strokeWidth={2} />
            <span className="sm:inline hidden">{label}</span>
            <span className="sm:hidden inline">AI</span>
          </>
        )
      )}
    </Button>
  );
};

export default AiSuggestionButton;


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
        "neo-ai-button relative overflow-hidden font-bold uppercase",
        "transform transition-all duration-300",
        "border-4 border-black bg-white rounded-xl",
        "active:translate-x-0 active:translate-y-0 active:shadow-none",
        className
      )}
      size={size}
      disabled={isLoading}
      variant={variant}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="spinner-container relative">
            <div className="h-5 w-5 rounded-full border-3 border-current border-t-transparent animate-spin" />
            <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-yellow-300 border border-black rounded-full animate-neo-pulse opacity-80" />
            <div className="absolute -bottom-2 -left-2 w-2.5 h-2.5 bg-blue-300 border border-black rounded-full animate-neo-float opacity-80" />
          </div>
          <span className="animate-pulse">Working...</span>
        </div>
      ) : (
        children || (
          <>
            <span className="ai-sparkle absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-black animate-neo-float opacity-75"></span>
            <span className="ai-sparkle absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-black animate-neo-pulse opacity-75"></span>
            <Sparkles className="h-4 w-4 mr-2 animate-neo-pulse" strokeWidth={2.5} />
            <span className="sm:inline hidden">{label}</span>
            <span className="sm:hidden inline">AI</span>
          </>
        )
      )}
      <div className="neo-shadow absolute -z-10 top-2 left-2 w-full h-full bg-black rounded-xl"></div>
    </Button>
  );
};

export default AiSuggestionButton;


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
    <div className="ai-btn-container relative">
      <Button
        onClick={onClick}
        className={cn(
          "ai-btn relative overflow-hidden font-black uppercase tracking-wide",
          "transform transition-all duration-300 ease-in-out",
          "border-4 border-black rounded-xl",
          "active:translate-x-0 active:translate-y-0 active:shadow-none",
          "hover:-translate-y-1 hover:-translate-x-1",
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
              <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-yellow-300 border border-black rounded-full animate-bounce opacity-80" />
              <div className="absolute -bottom-2 -left-2 w-2.5 h-2.5 bg-blue-300 border border-black rounded-full animate-pulse opacity-80" />
            </div>
            <span className="animate-pulse">Working...</span>
          </div>
        ) : (
          children || (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse" strokeWidth={2.5} />
              <span className="sm:inline hidden">{label}</span>
              <span className="sm:hidden inline">AI</span>
            </div>
          )
        )}
      </Button>
      
      {/* Neo-brutalist star shadow using CSS clip-path */}
      <div className="neo-star-shadow absolute -z-10 top-3 left-3 w-full h-full bg-black rounded-xl"
        style={{
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
        }}
      ></div>
      
      {/* Floating decorative elements */}
      <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full border-2 border-black animate-neo-pulse opacity-70"></div>
      <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-blue-400 rounded-full border-2 border-black animate-neo-float opacity-70"></div>
      
      {/* Neo-brutalist animated decorations - only visible on larger screens */}
      <div className="hidden sm:block absolute top-1/2 -right-4 transform -translate-y-1/2">
        <div className="w-4 h-4 bg-pink-400 border-2 border-black rotate-45 animate-neo-float opacity-80"></div>
      </div>
      <div className="hidden sm:block absolute top-1/2 -left-4 transform -translate-y-1/2">
        <div className="w-4 h-4 bg-green-400 border-2 border-black rotate-12 animate-neo-pulse opacity-80"></div>
      </div>
    </div>
  );
};

export default AiSuggestionButton;

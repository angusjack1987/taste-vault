
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
  variant?: "default" | "sunshine" | "berry" | "ocean" | "mint" | "forest";
}

const AiSuggestionButton = ({
  onClick,
  label = "AI Suggestions",
  className,
  size = "default",
  isLoading = false,
  children,
  variant = "sunshine",
}: AiSuggestionButtonProps) => {
  // Define variant-specific styles
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
    sunshine: "bg-amber-500 text-white hover:bg-amber-600 border-amber-600",
    berry: "bg-purple-600 text-white hover:bg-purple-700 border-purple-700",
    ocean: "bg-blue-600 text-white hover:bg-blue-700 border-blue-700",
    mint: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700",
    forest: "bg-green-800 text-white hover:bg-green-700 border-green-900"
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group rounded-full border-2 shadow-md transition-all duration-300",
        variantStyles[variant] || variantStyles.default,
        "transform hover:-translate-y-1",
        className
      )}
      size={size}
      disabled={isLoading}
      variant={variant}
    >
      <span className="absolute inset-0 w-full h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Processing...
        </div>
      ) : (
        children || (
          <>
            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            {label}
          </>
        )
      )}
    </Button>
  );
};

export default AiSuggestionButton;

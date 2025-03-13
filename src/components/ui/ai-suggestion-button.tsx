
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSuggestionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xl";
  isLoading?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "sunshine" | "berry" | "ocean" | "mint";
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
  return (
    <Button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group rounded-full border-2 border-sunshine-600 shadow-md",
        className
      )}
      size={size}
      variant={variant}
      disabled={isLoading}
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


import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSuggestionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  children?: React.ReactNode;
}

const AiSuggestionButton = ({
  onClick,
  label = "AI Suggestions",
  className,
  size = "default",
  isLoading = false,
  children,
}: AiSuggestionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "bg-sunshine-500 hover:bg-sunshine-400 text-charcoal-800 relative overflow-hidden group rounded-full border-2 border-sunshine-600 shadow-md",
        className
      )}
      size={size}
      disabled={isLoading}
    >
      <span className="absolute inset-0 w-full h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      {children || (
        <>
          <Sparkles className="h-4 w-4 mr-2 text-charcoal-800 animate-pulse" />
          {label}
        </>
      )}
    </Button>
  );
};

export default AiSuggestionButton;

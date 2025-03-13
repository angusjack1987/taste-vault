
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
}

const AiSuggestionButton = ({
  onClick,
  label = "AI Suggestions",
  className,
  size = "default",
  isLoading = false,
}: AiSuggestionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "bg-secondary hover:bg-secondary/90 text-secondary-foreground relative overflow-hidden group rounded-full",
        className
      )}
      size={size}
      disabled={isLoading}
    >
      <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <Sparkles className="h-4 w-4 mr-2 text-primary" />
      {label}
    </Button>
  );
};

export default AiSuggestionButton;

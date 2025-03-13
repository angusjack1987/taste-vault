
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
        "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 relative overflow-hidden group",
        className
      )}
      size={size}
      disabled={isLoading}
    >
      <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <Sparkles className="h-4 w-4 mr-2 animate-pulse text-white" />
      {label}
      <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping opacity-75" />
    </Button>
  );
};

export default AiSuggestionButton;

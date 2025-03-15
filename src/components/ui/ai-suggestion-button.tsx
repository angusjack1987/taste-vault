
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
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "clean" | "menu" | "tomato" | "lettuce" | "cheese" | "bread" | "blueberry";
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
        "relative overflow-hidden font-medium uppercase bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all active:translate-x-0 active:translate-y-0 active:shadow-none rounded-xl",
        className
      )}
      size={size}
      disabled={isLoading}
      variant={variant}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="animate-pulse">Processing...</span>
        </div>
      ) : (
        children || (
          <>
            <Sparkles className="h-4 w-4 mr-2 animate-neo-pulse" strokeWidth={2} />
            {label}
          </>
        )
      )}
    </Button>
  );
};

export default AiSuggestionButton;

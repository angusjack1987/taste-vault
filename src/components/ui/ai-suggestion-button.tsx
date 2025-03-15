
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
        "relative overflow-hidden font-black uppercase bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[9px_9px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all active:translate-x-0 active:translate-y-0 active:shadow-none rounded-xl",
        className
      )}
      size={size}
      disabled={isLoading}
      variant={variant}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border-4 border-current border-t-transparent animate-spin" />
          <span className="animate-pulse">Processing...</span>
        </div>
      ) : (
        children || (
          <>
            <Sparkles className="h-5 w-5 mr-2 animate-neo-pulse" strokeWidth={3} />
            {label}
          </>
        )
      )}
    </Button>
  );
};

export default AiSuggestionButton;

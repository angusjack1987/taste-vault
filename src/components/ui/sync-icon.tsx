
import React from "react";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

interface SyncIconProps {
  isSyncing?: boolean;
  className?: string;
}

const SyncIcon = ({ isSyncing = false, className }: SyncIconProps) => {
  return (
    <div className={cn("relative", className)}>
      <RotateCw
        className={cn(
          "h-5 w-5 text-primary transition-all duration-300",
          isSyncing ? "animate-spin opacity-100" : "opacity-50"
        )}
      />
      {isSyncing && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
};

export default SyncIcon;

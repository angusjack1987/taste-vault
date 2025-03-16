
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Checking connection status..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingState;


import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  text?: string;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  text = "Generating recipe...",
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-b-transparent border-l-primary border-r-primary animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-t-transparent border-b-transparent border-l-secondary border-r-secondary animate-spin-slow"></div>
        <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-4 border-t-transparent border-b-transparent border-l-accent border-r-accent animate-spin-reverse"></div>
      </div>
      <p className="text-lg font-medium animate-pulse">{text}</p>
      <div className="mt-4 flex space-x-2">
        <span className="h-3 w-3 bg-primary rounded-full animate-bounce"></span>
        <span className="h-3 w-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="h-3 w-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
      </div>
    </div>
  );
};

export default LoadingAnimation;

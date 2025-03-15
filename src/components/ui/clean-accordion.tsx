
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CleanAccordionProps {
  className?: string;
  children: React.ReactNode;
}

export const CleanAccordion = ({ className, children }: CleanAccordionProps) => {
  return (
    <div className={cn("border-2 border-black rounded-xl overflow-hidden", className)}>
      {children}
    </div>
  );
};

interface CleanAccordionItemProps {
  className?: string;
  children: React.ReactNode;
}

export const CleanAccordionItem = ({ className, children }: CleanAccordionItemProps) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

interface CleanAccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const CleanAccordionTrigger = ({ className, children, isOpen, onToggle }: CleanAccordionTriggerProps) => {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors font-medium focus:outline-none",
        className
      )}
      onClick={onToggle}
    >
      {children}
      <ChevronDown 
        className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
      />
    </button>
  );
};

interface CleanAccordionContentProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
}

export const CleanAccordionContent = ({ className, children, isOpen }: CleanAccordionContentProps) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        className
      )}
    >
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-black/10">
          {children}
        </div>
      )}
    </div>
  );
};

interface CleanNeoBrutalistAccordionProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CleanNeoBrutalistAccordion = ({ value, title, children, className }: CleanNeoBrutalistAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <CleanAccordion className={className}>
      <CleanAccordionItem>
        <CleanAccordionTrigger isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
          {title}
        </CleanAccordionTrigger>
        <CleanAccordionContent isOpen={isOpen}>
          {children}
        </CleanAccordionContent>
      </CleanAccordionItem>
    </CleanAccordion>
  );
};

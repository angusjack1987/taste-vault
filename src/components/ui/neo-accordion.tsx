
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface NeoAccordionProps {
  className?: string;
  children: React.ReactNode;
}

export const NeoAccordion = ({ className, children }: NeoAccordionProps) => {
  return (
    <div className={cn("border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]", className)}>
      {children}
    </div>
  );
};

interface NeoAccordionItemProps {
  className?: string;
  children: React.ReactNode;
}

export const NeoAccordionItem = ({ className, children }: NeoAccordionItemProps) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

interface NeoAccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const NeoAccordionTrigger = ({ className, children, isOpen, onToggle }: NeoAccordionTriggerProps) => {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between px-5 py-4 hover:bg-[#f4f4f0] transition-colors font-medium focus:outline-none",
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

interface NeoAccordionContentProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
}

export const NeoAccordionContent = ({ className, children, isOpen }: NeoAccordionContentProps) => {
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

interface NeoBrutalistAccordionProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const NeoBrutalistAccordion = ({ value, title, children, className }: NeoBrutalistAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <NeoAccordion className={className}>
      <NeoAccordionItem>
        <NeoAccordionTrigger isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
          {title}
        </NeoAccordionTrigger>
        <NeoAccordionContent isOpen={isOpen}>
          {children}
        </NeoAccordionContent>
      </NeoAccordionItem>
    </NeoAccordion>
  );
};

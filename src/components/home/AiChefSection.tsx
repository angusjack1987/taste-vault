
import React from 'react';
import { Sparkles } from 'lucide-react';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';

interface AiChefSectionProps {
  onOpenSuggestDialog: () => void;
}

const AiChefSection = ({ onOpenSuggestDialog }: AiChefSectionProps) => {
  return (
    <section className="mb-10">
      <div className="section-green flex flex-col items-center text-center py-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-6 top-3 transform rotate-12">
          <div className="w-16 h-16 bg-yellow-300 border-2 border-black rounded-full animate-neo-float"></div>
        </div>
        
        <div className="absolute -left-4 bottom-3 transform -rotate-12">
          <div className="w-12 h-12 bg-red-300 border-2 border-black rounded-full animate-neo-pulse"></div>
        </div>
        
        <div className="absolute top-20 right-20">
          <div className="w-10 h-10 bg-blue-300 border-2 border-black rounded-full animate-neo-float"></div>
        </div>
        
        <div className="absolute bottom-10 left-20 transform rotate-6">
          <div className="w-8 h-8 bg-green-300 border-2 border-black rounded-full animate-bounce opacity-60"></div>
        </div>
        
        <Sparkles className="h-12 w-12 text-black mb-3 animate-neo-pulse" strokeWidth={2.5} />
        <h2 className="text-2xl font-bold uppercase mb-3">AI Recipe Assistant</h2>
        <p className="text-black font-medium mb-5 max-w-md">
          We will feed you tasty and cheap food! Let our AI chef suggest personalized recipes.
        </p>
        
        <AiSuggestionButton
          onClick={onOpenSuggestDialog}
          label="Get Recipe Ideas"
          className="font-bold text-lg uppercase"
          variant="cheese"
        />
      </div>
    </section>
  );
};

export default AiChefSection;

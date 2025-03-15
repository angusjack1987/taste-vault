
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
          <div className="w-16 h-16 bg-yellow-300 border-4 border-black rounded-2xl animate-neo-float"></div>
        </div>
        
        <div className="absolute -left-4 bottom-3 transform -rotate-12">
          <div className="w-12 h-12 bg-red-300 border-4 border-black rounded-2xl animate-neo-pulse"></div>
        </div>
        
        <Sparkles className="h-12 w-12 text-black mb-3 animate-neo-pulse" strokeWidth={3} />
        <h2 className="text-2xl font-black uppercase mb-3 neo-text-chunky">AI Recipe Assistant</h2>
        <p className="text-black font-bold mb-5 max-w-md">
          We will feed you tasty and cheap food! Let our AI chef suggest personalized recipes.
        </p>
        
        <AiSuggestionButton
          onClick={onOpenSuggestDialog}
          label="Get Recipe Ideas"
          className="font-black text-lg uppercase border-4 border-black px-6 py-4 rounded-xl shadow-neo-heavy hover:shadow-neo-hover"
          variant="cheese"
        />
      </div>
    </section>
  );
};

export default AiChefSection;

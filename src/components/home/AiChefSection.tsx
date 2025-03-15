
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
        <div className="absolute -right-6 bottom-0 transform rotate-12">
          <img 
            src="/lovable-uploads/5001f999-2b6b-4f02-87f0-115c6b57f592.png" 
            alt="Food characters" 
            className="w-32 h-auto opacity-50"
          />
        </div>
        
        <Sparkles className="h-12 w-12 text-black mb-3 animate-character" strokeWidth={3} />
        <h2 className="text-2xl font-black uppercase mb-3 neo-text-chunky">AI Recipe Assistant</h2>
        <p className="text-black font-bold mb-5 max-w-md">
          We will feed you tasty and cheap food! Let our AI chef suggest personalized recipes.
        </p>
        
        <AiSuggestionButton
          onClick={onOpenSuggestDialog}
          label="Get Recipe Ideas"
          className="font-black text-lg uppercase border-4 border-black px-6 py-4 rounded-xl"
          variant="clean"
        />
      </div>
    </section>
  );
};

export default AiChefSection;

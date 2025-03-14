
import React from 'react';
import { Sparkles } from 'lucide-react';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';

interface AiChefSectionProps {
  onOpenSuggestDialog: () => void;
}

const AiChefSection = ({ onOpenSuggestDialog }: AiChefSectionProps) => {
  return (
    <section className="mb-10">
      <div className="playful-card bg-secondary/10 border-secondary/30">
        <div className="flex flex-col items-center text-center">
          <Sparkles className="h-10 w-10 text-secondary mb-3" />
          <h2 className="text-xl font-bold mb-2">AI Recipe Assistant</h2>
          <p className="text-muted-foreground mb-4">
            Need inspiration? Let our AI chef suggest personalized recipes based on your preferences.
          </p>
          
          <AiSuggestionButton
            onClick={onOpenSuggestDialog}
            label="Get Recipe Ideas"
            className="rounded-full"
          />
        </div>
      </div>
    </section>
  );
};

export default AiChefSection;

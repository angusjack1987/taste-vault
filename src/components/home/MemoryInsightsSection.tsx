
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MemoryInsightsSectionProps {
  memoryLoading: boolean;
  memoryPreview: string | null;
  isMemoryEnabled: boolean;
  onOpenMemoryDialog: () => void;
  onGenerateInsights: () => void;
}

const MemoryInsightsSection = ({
  memoryLoading,
  memoryPreview,
  isMemoryEnabled,
  onOpenMemoryDialog,
  onGenerateInsights
}: MemoryInsightsSectionProps) => {
  // Always render the component regardless of isMemoryEnabled
  
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Cooking Insights</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onOpenMemoryDialog}
          className="text-sm font-medium flex items-center"
        >
          View all <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="playful-card bg-primary/10 border-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          {memoryLoading ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p>Loading your cooking insights...</p>
            </div>
          ) : memoryPreview ? (
            <>
              <p className="text-base">{memoryPreview}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4"
                onClick={onOpenMemoryDialog}
              >
                <Brain className="h-4 w-4 mr-2" />
                See Full Insights
              </Button>
            </>
          ) : (
            <div className="py-3">
              <p>{isMemoryEnabled ? 
                "No insights available yet. Keep using the app to get personalized cooking insights!" : 
                "AI Memory is currently disabled in your settings. Enable it for personalized cooking insights."}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4"
                onClick={isMemoryEnabled ? onGenerateInsights : onOpenMemoryDialog}
              >
                <Brain className="h-4 w-4 mr-2" />
                {isMemoryEnabled ? "Generate Insights" : "Enable AI Memory"}
              </Button>
            </div>
          )}
        </div>
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
          <Brain className="h-32 w-32 text-primary" />
        </div>
      </div>
    </section>
  );
};

export default MemoryInsightsSection;

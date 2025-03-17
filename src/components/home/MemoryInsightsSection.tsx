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
  lastUpdated: string | null;
}
const MemoryInsightsSection = ({
  memoryLoading,
  memoryPreview,
  isMemoryEnabled,
  onOpenMemoryDialog,
  onGenerateInsights,
  lastUpdated
}: MemoryInsightsSectionProps) => {
  return <section className="mb-8">
      
      
      <div className="section-pink py-8 px-6 rounded-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-20">
          <Brain className="h-40 w-40" strokeWidth={3} />
        </div>
        
        <div className="relative z-10">
          {memoryLoading ? <div className="flex items-center gap-3 py-3 bg-white p-4 border-4 border-black">
              <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} />
              <p className="font-bold">Loading your cooking insights...</p>
            </div> : memoryPreview ? <>
              <div className="text-base prose prose-sm max-w-none font-bold bg-white p-5 border-4 border-black shadow-neo-light" dangerouslySetInnerHTML={{
            __html: memoryPreview
          }} />
              {lastUpdated && <div className="text-xs font-bold mt-3 bg-black text-white inline-block px-3 py-1">
                  Updated: {new Date(lastUpdated).toLocaleString()}
                </div>}
              <Button variant="secondary" size="lg" className="mt-5 rounded-none font-bold uppercase border-4 border-black shadow-neo-light hover:shadow-neo-medium hover:-translate-x-1 hover:-translate-y-1 transition-all" onClick={onOpenMemoryDialog}>
                <Brain className="h-5 w-5 mr-2" strokeWidth={3} />
                See Full Insights
              </Button>
            </> : <div className="bg-white p-5 border-4 border-black shadow-neo-light">
              <p className="font-bold">{isMemoryEnabled ? "No insights available yet. Keep using the app to get personalized cooking insights!" : "AI Memory is currently disabled in your settings. Enable it for personalized cooking insights."}</p>
              <Button variant="secondary" size="lg" onClick={isMemoryEnabled ? onGenerateInsights : onOpenMemoryDialog} className="mt-5 rounded-none font-bold uppercase border-4 border-black shadow-neo-light hover:shadow-neo-medium hover:-translate-x-1 hover:-translate-y-1 transition-all my-[14px] mx-0 text-left py-[8px] px-[11px]">
                <Brain className="h-5 w-5 mr-2" strokeWidth={3} />
                {isMemoryEnabled ? "Generate Insights" : "Enable AI Memory"}
              </Button>
            </div>}
        </div>
      </div>
    </section>;
};
export default MemoryInsightsSection;

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Loader2 } from 'lucide-react';
import useAiMemory from '@/hooks/useAiMemory';

interface AiMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AiMemoryDialog = ({ open, onOpenChange }: AiMemoryDialogProps) => {
  const { loading, insights, getMemoryInsights } = useAiMemory();

  useEffect(() => {
    if (open && !insights && !loading) {
      getMemoryInsights();
    }
  }, [open, insights, loading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" scrollable maxHeight="85vh">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Memory Insights
          </DialogTitle>
          <DialogDescription>
            Personalized cooking insights based on your recipe history and preferences
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-140px)] -mr-6 pr-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing your cooking journey...</p>
            </div>
          ) : insights ? (
            <div className="mt-2 space-y-4 whitespace-pre-line">
              {insights.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-muted-foreground">No insights available. Please try again.</p>
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button 
            onClick={() => getMemoryInsights()} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Insights'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiMemoryDialog;

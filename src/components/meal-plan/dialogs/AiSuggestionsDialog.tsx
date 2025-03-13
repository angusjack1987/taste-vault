
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AiSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetSuggestions: (preferences: string, dietaryRestrictions: string) => Promise<void>;
  aiLoading: boolean;
  suggestions: string | null;
}

const AiSuggestionsDialog = ({ 
  open, 
  onOpenChange,
  onGetSuggestions,
  aiLoading,
  suggestions
}: AiSuggestionsDialogProps) => {
  const [preferences, setPreferences] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  const handleGetSuggestions = () => {
    onGetSuggestions(preferences, dietaryRestrictions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" scrollable maxHeight="70vh">
        <DialogHeader>
          <DialogTitle>
            AI Recipe Suggestions
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(70vh-120px)] mt-2 -mr-6 pr-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferences">Your Preferences</Label>
              <Input
                id="preferences"
                placeholder="e.g., quick meals, Italian cuisine, low carb"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restrictions">Dietary Restrictions</Label>
              <Input
                id="restrictions"
                placeholder="e.g., vegetarian, gluten-free, no nuts"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleGetSuggestions} 
              disabled={aiLoading}
              className="w-full"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Suggestions
                </>
              )}
            </Button>
            
            {suggestions && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Suggested Recipes:</h3>
                <div className="text-sm whitespace-pre-line">
                  {suggestions}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AiSuggestionsDialog;

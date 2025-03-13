
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MealType } from '@/hooks/useMealPlans';

interface SuggestedMeal {
  title: string;
  description: string;
  ingredients?: string[];
  instructions?: string[];
  time?: number | null;
  servings?: number | null;
  rawResponse?: string;
}

interface SuggestMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: Date | null;
  currentMealType: MealType | null;
  suggestMealType: MealType;
  setSuggestMealType: (type: MealType) => void;
  aiLoading: boolean;
  suggestedMeal: SuggestedMeal | null;
  parsingMealSuggestion: boolean;
  additionalPreferences: string;
  setAdditionalPreferences: (value: string) => void;
  onSuggestMeal: () => Promise<void>;
  onSaveSuggestedRecipe: () => Promise<void>;
  onResetSuggestedMeal: () => void;
}

const SuggestMealDialog = ({
  open,
  onOpenChange,
  currentDay,
  currentMealType,
  suggestMealType,
  setSuggestMealType,
  aiLoading,
  suggestedMeal,
  parsingMealSuggestion,
  additionalPreferences,
  setAdditionalPreferences,
  onSuggestMeal,
  onSaveSuggestedRecipe,
  onResetSuggestedMeal
}: SuggestMealDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" scrollable maxHeight="80vh">
        <DialogHeader>
          <DialogTitle>
            AI Meal Suggestion
          </DialogTitle>
          <DialogDescription>
            Get an AI-generated recipe suggestion based on your preferences.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-140px)] -mr-6 pr-6">
          {!suggestedMeal ? (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select 
                  value={suggestMealType} 
                  onValueChange={(value) => setSuggestMealType(value as MealType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferences">Additional Preferences</Label>
                <Textarea
                  id="preferences"
                  placeholder="e.g., quick, vegetarian, Italian, etc."
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={onSuggestMeal} 
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestion...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get Suggestion
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {parsingMealSuggestion ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{suggestedMeal.title}</h3>
                    <p className="text-sm text-muted-foreground">{suggestedMeal.description}</p>
                    
                    {suggestedMeal.rawResponse ? (
                      <div className="mt-4 p-3 bg-muted rounded-md text-sm whitespace-pre-line">
                        {suggestedMeal.rawResponse}
                      </div>
                    ) : (
                      <>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">Ingredients:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {suggestedMeal.ingredients?.map((ingredient: string, idx: number) => (
                              <li key={idx}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">Instructions:</h4>
                          <ol className="list-decimal pl-5 text-sm space-y-2">
                            {suggestedMeal.instructions?.map((step: string, idx: number) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                          {suggestedMeal.time && (
                            <div>
                              <span className="font-medium">Time:</span> {suggestedMeal.time} minutes
                            </div>
                          )}
                          {suggestedMeal.servings && (
                            <div>
                              <span className="font-medium">Servings:</span> {suggestedMeal.servings}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>
        
        {suggestedMeal && !parsingMealSuggestion && (
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={onResetSuggestedMeal}
              className="sm:flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={onSaveSuggestedRecipe}
              className="sm:flex-1"
              disabled={!!suggestedMeal.rawResponse}
            >
              {currentDay && currentMealType 
                ? "Save & Add to Plan" 
                : "Save Recipe"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuggestMealDialog;

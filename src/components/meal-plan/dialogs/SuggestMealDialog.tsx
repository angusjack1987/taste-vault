
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MealType } from '@/hooks/useMealPlans';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Coffee, UtensilsCrossed, Soup, RefreshCw } from 'lucide-react';

interface SuggestMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: Date | null;
  currentMealType: MealType | null;
  suggestMealType: MealType;
  setSuggestMealType: (type: MealType) => void;
  additionalPreferences: string;
  setAdditionalPreferences: (prefs: string) => void;
  aiLoading: boolean;
  parsingMealSuggestion: boolean;
  suggestedMeal: any | null;
  onSuggestMeal: () => void;
  onSaveSuggestedRecipe: (optionIndex: number) => Promise<void>;
  onResetSuggestedMeal: () => void;
  onRetrySingleOption?: (index: number) => void;
}

const SuggestMealDialog: React.FC<SuggestMealDialogProps> = ({
  open,
  onOpenChange,
  currentDay,
  currentMealType,
  suggestMealType,
  setSuggestMealType,
  additionalPreferences,
  setAdditionalPreferences,
  aiLoading,
  parsingMealSuggestion,
  suggestedMeal,
  onSuggestMeal,
  onSaveSuggestedRecipe,
  onResetSuggestedMeal,
  onRetrySingleOption
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const handleCloseDialog = () => {
    setSelectedOption(null);
    onResetSuggestedMeal();
    onOpenChange(false);
  };
  
  const handleSaveSuggestedRecipe = async () => {
    if (selectedOption !== null) {
      await onSaveSuggestedRecipe(selectedOption);
    }
  };
  
  const isLoading = aiLoading || parsingMealSuggestion;
  
  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Meal Suggestion</DialogTitle>
          <DialogDescription>
            {currentDay ? (
              <span>Generate meal ideas for {format(currentDay, 'EEEE, MMMM d')} {currentMealType}</span>
            ) : (
              <span>Generate meal ideas based on your preferences</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {!suggestedMeal ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={suggestMealType}
                  onValueChange={(value) => value && setSuggestMealType(value as MealType)}
                  className="flex justify-start"
                >
                  <ToggleGroupItem value="breakfast" aria-label="Breakfast">
                    <Coffee className="h-4 w-4 mr-2" />
                    Breakfast
                  </ToggleGroupItem>
                  <ToggleGroupItem value="lunch" aria-label="Lunch">
                    <Soup className="h-4 w-4 mr-2" />
                    Lunch
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dinner" aria-label="Dinner">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Dinner
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Additional Preferences</Label>
                <Textarea
                  placeholder="Optional: Include any dietary restrictions, preferences, or ingredients you'd like to use..."
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-center">Generating meal suggestions... This might take a moment.</p>
            </div>
          ) : suggestedMeal.rawResponse ? (
            <div className="p-4 border rounded-md whitespace-pre-wrap font-mono text-sm">
              {suggestedMeal.rawResponse}
            </div>
          ) : suggestedMeal.options && suggestedMeal.options.length > 0 ? (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Choose a recipe to save:</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {suggestedMeal.options.map((option: any, index: number) => (
                  <div 
                    key={index}
                    className={`border-2 p-4 rounded-lg cursor-pointer ${
                      selectedOption === index ? 'border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedOption(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold">{option.title}</h4>
                      
                      {onRetrySingleOption && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetrySingleOption(index);
                          }}
                          title="Regenerate this option"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                    
                    {option.time && (
                      <p className="text-sm mb-2"><strong>Time:</strong> {option.time} minutes</p>
                    )}
                    
                    {option.servings && (
                      <p className="text-sm mb-2"><strong>Servings:</strong> {option.servings}</p>
                    )}
                    
                    <div className="mt-3">
                      <h5 className="font-medium mb-1">Ingredients:</h5>
                      <ul className="text-sm pl-5 list-disc">
                        {option.ingredients.slice(0, 5).map((ing: string, i: number) => (
                          <li key={i}>{ing}</li>
                        ))}
                        {option.ingredients.length > 5 && (
                          <li>...and {option.ingredients.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-medium mb-1">Instructions:</h5>
                      <ol className="text-sm pl-5 list-decimal">
                        {option.instructions.slice(0, 2).map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                        {option.instructions.length > 2 && (
                          <li>...and {option.instructions.length - 2} more steps</li>
                        )}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-md bg-red-50">
              <p>Sorry, we couldn't generate meal suggestions. Please try again.</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-2">
          {!suggestedMeal ? (
            <>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={onSuggestMeal} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Suggestions
              </Button>
            </>
          ) : isLoading ? (
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
          ) : (
            <>
              <div className="flex gap-2 w-full justify-between sm:justify-end">
                <Button variant="outline" onClick={onResetSuggestedMeal}>
                  Start Over
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveSuggestedRecipe}
                  disabled={selectedOption === null || !suggestedMeal.options}
                >
                  Save Recipe
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestMealDialog;

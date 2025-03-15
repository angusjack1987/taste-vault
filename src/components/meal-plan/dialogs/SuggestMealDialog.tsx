
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Lightbulb, Loader2, ChefHat, Clock, Users, Star, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MealType } from '@/hooks/useMealPlans';

interface MealOption {
  title: string;
  description: string;
  highlights?: string[];
  ingredients?: string[];
  instructions?: string[];
  time?: number | null;
  servings?: number | null;
}

interface SuggestedMeal {
  options?: MealOption[];
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
  onSaveSuggestedRecipe: (optionIndex: number) => Promise<void>;
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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" scrollable maxHeight="85vh">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            AI Meal Inspiration
          </DialogTitle>
          <DialogDescription>
            Let AI suggest delicious meal ideas based on your preferences
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-140px)] -mr-6 pr-6">
          {!suggestedMeal ? (
            <div className="space-y-5 mt-2 p-2">
              <div className="space-y-3">
                <Label htmlFor="meal-type" className="text-base">What type of meal are you planning?</Label>
                <Select 
                  value={suggestMealType} 
                  onValueChange={(value) => setSuggestMealType(value as MealType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="preferences" className="text-base">Any specific preferences?</Label>
                <Textarea
                  id="preferences"
                  placeholder="e.g., quick, vegetarian, high-protein, Italian, spicy, etc."
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  className="min-h-[100px] text-base"
                />
              </div>
              
              <Button 
                onClick={onSuggestMeal} 
                disabled={aiLoading}
                className="w-full text-base py-6"
                variant="cheese"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finding Perfect Meal Ideas...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Get Meal Suggestions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {parsingMealSuggestion ? (
                <div className="py-10 relative text-center">
                  {/* Neo-brutalist animation elements */}
                  <div className="absolute top-0 left-10 w-16 h-16 bg-green-300 border-4 border-black rounded-2xl animate-neo-float opacity-40 z-0"></div>
                  <div className="absolute bottom-10 right-10 w-14 h-14 bg-orange-300 border-4 border-black rounded-2xl animate-bounce opacity-30 z-0"></div>
                  
                  <div className="relative z-10 bg-white p-6 border-4 border-black rounded-xl shadow-neo-heavy animate-pulse">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <div className="text-lg font-black uppercase">Preparing culinary inspiration</div>
                    <div className="text-muted-foreground font-bold">Cooking up delicious ideas...</div>
                  </div>
                </div>
              ) : suggestedMeal.rawResponse ? (
                <div className="mt-4 p-5 bg-white border-4 border-black rounded-xl shadow-neo text-sm whitespace-pre-line">
                  {suggestedMeal.rawResponse}
                </div>
              ) : suggestedMeal.options && Array.isArray(suggestedMeal.options) && suggestedMeal.options.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-center">Select a meal option:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedMeal.options.map((option, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          "border-4 border-black rounded-xl p-4 cursor-pointer transition-all hover:shadow-neo-hover hover:-translate-y-1",
                          selectedOption === idx 
                            ? "shadow-neo-heavy bg-primary/5" 
                            : "shadow-neo"
                        )}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold">{option.title}</h3>
                          <div className={cn(
                            "rounded-full border-2 border-black w-6 h-6 flex items-center justify-center bg-white",
                            selectedOption === idx ? "bg-primary text-primary-foreground" : ""
                          )}>
                            {selectedOption === idx 
                              ? <CheckCircle2 className="h-5 w-5" /> 
                              : <Circle className="h-5 w-5" />
                            }
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{option.description}</p>
                        
                        {option.highlights && Array.isArray(option.highlights) && option.highlights.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {option.highlights.map((highlight, hidx) => (
                                <div key={hidx} className="bg-yellow-200 text-black text-xs px-2 py-1 rounded-full border-2 border-black flex items-center shadow-neo-sm">
                                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                                  {highlight}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {option.time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {option.time} min
                            </div>
                          )}
                          {option.servings && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {option.servings} servings
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    {selectedOption !== null && suggestedMeal.options && suggestedMeal.options[selectedOption] && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <ChefHat className="h-4 w-4 mr-2" />
                          Recipe Details
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground mb-1">Ingredients:</h5>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {suggestedMeal.options[selectedOption].ingredients && 
                               Array.isArray(suggestedMeal.options[selectedOption].ingredients) && 
                               suggestedMeal.options[selectedOption].ingredients?.map((ingredient, idx) => (
                                <li key={idx}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground mb-1">Instructions:</h5>
                            <ol className="list-decimal pl-5 text-sm space-y-2">
                              {suggestedMeal.options[selectedOption].instructions && 
                               Array.isArray(suggestedMeal.options[selectedOption].instructions) && 
                               suggestedMeal.options[selectedOption].instructions?.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <p className="text-muted-foreground">No meal suggestions available. Please try again.</p>
                </div>
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
            {suggestedMeal.options && Array.isArray(suggestedMeal.options) && suggestedMeal.options.length > 0 && (
              <Button 
                onClick={() => selectedOption !== null && onSaveSuggestedRecipe(selectedOption)}
                className="sm:flex-1"
                disabled={selectedOption === null}
                variant="cheese"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {currentDay && currentMealType 
                  ? "Save to Recipe Library & Meal Plan" 
                  : "Save to Recipe Library"}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuggestMealDialog;

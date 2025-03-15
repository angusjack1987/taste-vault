
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, CalendarDays, Loader2 } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { MealType } from '@/hooks/useMealPlans';

interface MealSelection {
  [day: string]: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

interface PlanWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: Date;
  onGeneratePlan: (selectedDays: MealSelection) => Promise<void>;
  isGenerating: boolean;
}

const PlanWeekDialog: React.FC<PlanWeekDialogProps> = ({
  open,
  onOpenChange,
  weekStart,
  onGeneratePlan,
  isGenerating
}) => {
  // Initialize state for selected days
  const initialSelection: MealSelection = {};
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const dayKey = format(day, 'yyyy-MM-dd');
    initialSelection[dayKey] = {
      breakfast: false,
      lunch: false,
      dinner: false
    };
  }

  const [selectedDays, setSelectedDays] = useState<MealSelection>(initialSelection);
  
  // Helper to check if any meal is selected
  const hasSelections = Object.values(selectedDays).some(
    day => day.breakfast || day.lunch || day.dinner
  );

  // Toggle meal selection
  const toggleMealSelection = (day: string, meal: MealType) => {
    setSelectedDays({
      ...selectedDays,
      [day]: {
        ...selectedDays[day],
        [meal]: !selectedDays[day][meal]
      }
    });
  };

  // Toggle all meals for a day
  const toggleAllMealsForDay = (day: string, checked: boolean) => {
    setSelectedDays({
      ...selectedDays,
      [day]: {
        breakfast: checked,
        lunch: checked,
        dinner: checked
      }
    });
  };

  // Toggle a meal type for all days
  const toggleMealForAllDays = (meal: MealType, checked: boolean) => {
    const updatedSelection = { ...selectedDays };
    Object.keys(updatedSelection).forEach(day => {
      updatedSelection[day][meal] = checked;
    });
    setSelectedDays(updatedSelection);
  };

  // Toggle all meals for all days
  const toggleAllMeals = (checked: boolean) => {
    const updatedSelection = { ...selectedDays };
    Object.keys(updatedSelection).forEach(day => {
      updatedSelection[day] = {
        breakfast: checked,
        lunch: checked,
        dinner: checked
      };
    });
    setSelectedDays(updatedSelection);
  };

  // Check if all meals for a day are selected
  const isAllDaySelected = (day: string) => {
    return selectedDays[day].breakfast && 
           selectedDays[day].lunch && 
           selectedDays[day].dinner;
  };

  // Check if a specific meal type is selected for all days
  const isMealSelectedForAllDays = (meal: MealType) => {
    return Object.keys(selectedDays).every(day => selectedDays[day][meal]);
  };

  // Check if all meals for all days are selected
  const isEverythingSelected = () => {
    return Object.keys(selectedDays).every(day => isAllDaySelected(day));
  };

  // Handle generate plan click
  const handleGeneratePlan = () => {
    onGeneratePlan(selectedDays);
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setSelectedDays(initialSelection);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Plan My Week
          </DialogTitle>
          <DialogDescription>
            Select which days and meals you want AI to plan for you. The AI will consider your existing recipes and recent meals.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-auto pr-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Week of {format(weekStart, 'MMM d, yyyy')}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleAllMeals(!isEverythingSelected())}
                className="text-xs"
              >
                {isEverythingSelected() ? 'Unselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid gap-2 pb-4">
              <div className="grid grid-cols-4 gap-2 py-2 border-b">
                <div className="col-span-1 font-medium">Day</div>
                <div className="grid grid-cols-3 col-span-3 gap-1 text-center text-sm">
                  <div className="flex justify-center">
                    <Checkbox 
                      checked={isMealSelectedForAllDays('breakfast')}
                      onCheckedChange={(checked) => toggleMealForAllDays('breakfast', checked === true)}
                      id="all-breakfast"
                      className="mr-1"
                    />
                    <label htmlFor="all-breakfast" className="text-xs cursor-pointer">Breakfast</label>
                  </div>
                  <div className="flex justify-center">
                    <Checkbox 
                      checked={isMealSelectedForAllDays('lunch')}
                      onCheckedChange={(checked) => toggleMealForAllDays('lunch', checked === true)}
                      id="all-lunch" 
                      className="mr-1"
                    />
                    <label htmlFor="all-lunch" className="text-xs cursor-pointer">Lunch</label>
                  </div>
                  <div className="flex justify-center">
                    <Checkbox 
                      checked={isMealSelectedForAllDays('dinner')}
                      onCheckedChange={(checked) => toggleMealForAllDays('dinner', checked === true)}
                      id="all-dinner"
                      className="mr-1" 
                    />
                    <label htmlFor="all-dinner" className="text-xs cursor-pointer">Dinner</label>
                  </div>
                </div>
              </div>
              
              {Object.keys(selectedDays).map((dayKey, index) => {
                const day = new Date(dayKey);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={dayKey} 
                    className={`grid grid-cols-4 gap-2 py-2 ${isToday ? 'bg-primary/5 rounded-lg' : ''}`}
                  >
                    <div className="col-span-1 flex items-center">
                      <Checkbox 
                        checked={isAllDaySelected(dayKey)}
                        onCheckedChange={(checked) => toggleAllMealsForDay(dayKey, checked === true)}
                        id={`day-${index}`}
                        className="mr-2"
                      />
                      <label htmlFor={`day-${index}`} className="text-sm cursor-pointer">
                        {format(day, 'EEE, MMM d')}
                        {isToday && <span className="ml-1 text-xs text-primary">(Today)</span>}
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-3 col-span-3 gap-1 text-center text-sm">
                      <div className="flex justify-center">
                        <Checkbox 
                          checked={selectedDays[dayKey].breakfast}
                          onCheckedChange={() => toggleMealSelection(dayKey, 'breakfast')}
                          id={`${dayKey}-breakfast`}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox 
                          checked={selectedDays[dayKey].lunch}
                          onCheckedChange={() => toggleMealSelection(dayKey, 'lunch')}
                          id={`${dayKey}-lunch`}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox 
                          checked={selectedDays[dayKey].dinner}
                          onCheckedChange={() => toggleMealSelection(dayKey, 'dinner')}
                          id={`${dayKey}-dinner`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGeneratePlan}
            disabled={isGenerating || !hasSelections}
            className="relative"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Generate Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanWeekDialog;

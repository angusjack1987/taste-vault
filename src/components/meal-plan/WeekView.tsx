
import React from 'react';
import WeekDayCard from './WeekDayCard';
import MobileDayCard from './MobileDayCard';
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, addDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface WeekDayData {
  date: Date;
  meals: {
    breakfast?: MealPlanWithRecipe;
    lunch?: MealPlanWithRecipe;
    dinner?: MealPlanWithRecipe;
  };
}

interface WeekViewProps {
  weekDays: WeekDayData[];
  onAddMeal: (date: Date, mealType: MealType) => void;
  onRemoveMeal: (mealPlanId: string) => void;
  onSuggestMeal: (date: Date, mealType: MealType) => void;
}

const WeekView = ({ weekDays, onAddMeal, onRemoveMeal, onSuggestMeal }: WeekViewProps) => {
  const isMobile = useIsMobile();
  const weekStart = weekDays.length > 0 ? weekDays[0].date : new Date();
  const weekEnd = weekDays.length > 0 ? weekDays[weekDays.length - 1].date : new Date();
  
  const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  
  return (
    <div className="space-y-4">
      {/* Week navigation header */}
      <div className="flex items-center justify-between md:justify-center mb-2">
        <div className="flex items-center gap-3 md:gap-6">
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <h2 className="text-sm md:text-base font-medium">{weekLabel}</h2>
          
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full">
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-3 text-center text-sm mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <WeekDayCard
              key={day.date.toString()}
              date={day.date}
              meals={day.meals}
              onAddMeal={onAddMeal}
              onRemoveMeal={onRemoveMeal}
              onSuggestMeal={onSuggestMeal}
            />
          ))}
        </div>
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {weekDays.map((day) => (
          <MobileDayCard
            key={day.date.toString()}
            date={day.date}
            meals={day.meals}
            onAddMeal={onAddMeal}
            onRemoveMeal={onRemoveMeal}
            onSuggestMeal={onSuggestMeal}
          />
        ))}
      </div>
    </div>
  );
};

export default WeekView;

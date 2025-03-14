
import React, { useState } from 'react';
import WeekDayCard from './WeekDayCard';
import MobileDayCard from './MobileDayCard';
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, addDays, startOfWeek, subDays, addWeeks, subWeeks } from 'date-fns';
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
      <div className="flex items-center justify-between md:justify-center mb-4">
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
      
      {/* Desktop view - stacked days */}
      <div className="hidden md:block space-y-3">
        {weekDays.map((day) => (
          <div key={day.date.toString()} className="flex items-stretch">
            {/* Day label for desktop view */}
            <div className="w-32 mr-4 flex flex-col justify-center">
              <p className="font-medium">{format(day.date, 'EEEE')}</p>
              <p className="text-sm text-muted-foreground">{format(day.date, 'MMM d')}</p>
              {format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd') && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full mt-1 inline-block w-fit">Today</span>
              )}
            </div>
            
            {/* Meals container */}
            <div className="flex-1 grid grid-cols-3 gap-3">
              <WeekDayCard
                key={`${day.date.toString()}-desktop`}
                date={day.date}
                meals={day.meals}
                onAddMeal={onAddMeal}
                onRemoveMeal={onRemoveMeal}
                onSuggestMeal={onSuggestMeal}
                showDateHeader={false}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {weekDays.map((day) => (
          <MobileDayCard
            key={`${day.date.toString()}-mobile`}
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

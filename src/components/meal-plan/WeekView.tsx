
import React, { useState, useEffect, useRef } from 'react';
import WeekDayCard from './WeekDayCard';
import MobileDayCard from './MobileDayCard';
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, addDays, startOfWeek, subDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  
  // Ref for the today card in mobile view
  const todayCardRef = useRef<HTMLDivElement>(null);
  
  // Find today's index in weekDays
  const todayIndex = weekDays.findIndex(day => 
    format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')
  );
  
  // Scroll to today's card on initial render for mobile view
  useEffect(() => {
    if (isMobile && todayCardRef.current && todayIndex !== -1) {
      // Use a small timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        todayCardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [isMobile, todayIndex]);
  
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
      
      {/* Desktop view - days side by side, meals stacked */}
      <div className="hidden md:grid md:grid-cols-7 md:gap-3">
        {weekDays.map((day) => {
          const isToday = format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');
          
          return (
            <div 
              key={day.date.toString()} 
              className={cn(
                "flex flex-col rounded-lg p-3",
                isToday && "bg-primary/5 border border-primary"
              )}
            >
              <WeekDayCard
                key={`${day.date.toString()}-desktop`}
                date={day.date}
                meals={day.meals}
                onAddMeal={onAddMeal}
                onRemoveMeal={onRemoveMeal}
                onSuggestMeal={onSuggestMeal}
                showDateHeader={true}
              />
            </div>
          );
        })}
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {weekDays.map((day, index) => {
          const isToday = format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');
          
          return (
            <div 
              key={`${day.date.toString()}-mobile`}
              ref={isToday ? todayCardRef : null}
            >
              <MobileDayCard
                date={day.date}
                meals={day.meals}
                onAddMeal={onAddMeal}
                onRemoveMeal={onRemoveMeal}
                onSuggestMeal={onSuggestMeal}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;

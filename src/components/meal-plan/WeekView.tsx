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
  onQuickAddMeal: (date: Date, mealType: MealType) => void;
  onChangeWeek?: (newStartDate: Date) => void;
}
const WeekView = ({
  weekDays,
  onAddMeal,
  onRemoveMeal,
  onSuggestMeal,
  onQuickAddMeal,
  onChangeWeek
}: WeekViewProps) => {
  const isMobile = useIsMobile();
  const weekStart = weekDays.length > 0 ? weekDays[0].date : new Date();
  const weekEnd = weekDays.length > 0 ? weekDays[weekDays.length - 1].date : new Date();
  const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  // Ref for the today card in mobile view
  const todayCardRef = useRef<HTMLDivElement>(null);

  // Find today's index in weekDays
  const todayIndex = weekDays.findIndex(day => format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'));

  // Navigation handlers
  const handlePreviousWeek = () => {
    if (onChangeWeek) {
      const previousWeekStart = subWeeks(weekStart, 1);
      onChangeWeek(previousWeekStart);
    }
  };
  const handleNextWeek = () => {
    if (onChangeWeek) {
      const nextWeekStart = addWeeks(weekStart, 1);
      onChangeWeek(nextWeekStart);
    }
  };

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
  return <div className="space-y-4">
      {/* Week navigation header */}
      <div className="flex items-center justify-between md:justify-center mb-4">
        <div className="flex items-center gap-9 md:gap-6">
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <h2 className="text-sm md:text-base font-medium text-center">{weekLabel}</h2>
          
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
      
      {/* Desktop view - days side by side, meals stacked */}
      <div className="hidden md:grid md:grid-cols-7 md:gap-3">
        {weekDays.map(day => {
        const isToday = format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');
        return <div key={day.date.toString()} className={cn("flex flex-col rounded-lg p-3", isToday && "bg-primary/5 border border-primary")}>
              <WeekDayCard key={`${day.date.toString()}-desktop`} date={day.date} meals={day.meals} onAddMeal={onAddMeal} onRemoveMeal={onRemoveMeal} onSuggestMeal={onSuggestMeal} onQuickAddMeal={onQuickAddMeal} showDateHeader={true} />
            </div>;
      })}
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {weekDays.map((day, index) => {
        const isToday = format(new Date(), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');
        return <div key={`${day.date.toString()}-mobile`} ref={isToday ? todayCardRef : null} className="p-3 md:p-5 neo-container bg-white mb-5 shadow-neo-heavy border-4 border-black rounded-2xl">
              <MobileDayCard date={day.date} meals={day.meals} onAddMeal={onAddMeal} onRemoveMeal={onRemoveMeal} onSuggestMeal={onSuggestMeal} onQuickAddMeal={onQuickAddMeal} />
            </div>;
      })}
      </div>
    </div>;
};
export default WeekView;
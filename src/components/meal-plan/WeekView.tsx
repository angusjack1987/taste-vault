
import React from 'react';
import WeekDayCard from './WeekDayCard';
import MobileDayCard from './MobileDayCard';
import { MealPlanWithRecipe, MealType } from '@/hooks/useMealPlans';

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
  return (
    <>
      <div className="hidden md:grid md:grid-cols-7 gap-2 text-center text-sm mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="hidden md:grid md:grid-cols-7 gap-2">
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
    </>
  );
};

export default WeekView;

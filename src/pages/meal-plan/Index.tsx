
import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

// Mock data for our wireframe
const mockMeals = [
  {
    date: new Date(),
    meals: {
      breakfast: {
        id: "2",
        title: "Avocado Toast with Poached Egg",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=300",
      },
      lunch: null,
      dinner: {
        id: "1",
        title: "Classic Spaghetti Carbonara",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=300",
      },
    },
  },
  {
    date: addDays(new Date(), 1),
    meals: {
      breakfast: null,
      lunch: {
        id: "3",
        title: "Grilled Salmon with Asparagus",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300",
      },
      dinner: {
        id: "5",
        title: "Homemade Margherita Pizza",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
      },
    },
  },
];

const MealPlan = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get the start of the current week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  
  // Generate an array of 7 days starting from weekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const mealPlan = mockMeals.find(
      (meal) => format(meal.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date,
      meals: mealPlan?.meals || {
        breakfast: null,
        lunch: null,
        dinner: null,
      },
    };
  });
  
  const handleAddMeal = (date: Date, mealType: string) => {
    // This would open a meal selection dialog in a real implementation
    console.log(`Add ${mealType} for ${format(date, 'MMM d, yyyy')}`);
  };
  
  return (
    <MainLayout 
      title="Meal Plan" 
      action={
        <Button variant="ghost" size="icon">
          <Calendar className="h-5 w-5" />
        </Button>
      }
    >
      <div className="page-container">
        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={format(day.date, 'yyyy-MM-dd')}
              className="border border-border rounded-lg p-2 min-h-[200px]"
            >
              <div className="text-sm font-medium mb-2">
                {format(day.date, 'MMM d')}
              </div>
              
              <div className="space-y-2">
                {Object.entries(day.meals).map(([mealType, meal]) => (
                  <div key={mealType} className="text-left">
                    <div className="text-xs text-muted-foreground capitalize mb-1">
                      {mealType}
                    </div>
                    {meal ? (
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <img
                          src={meal.image}
                          alt={meal.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="text-xs line-clamp-2">
                          {meal.title}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => handleAddMeal(day.date, mealType)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-4">
              Based on your meal plan, you'll need:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                <span>350g spaghetti</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                <span>2 avocados</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                <span>6 large eggs</span>
              </li>
              {/* More items would be listed here */}
            </ul>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                View Full Shopping List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MealPlan;

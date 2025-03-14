
import { useEffect } from "react";
import { Coffee, Salad, ChefHat, Cake, Pizza, UtensilsCrossed, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { useRecipeFilters } from "@/contexts/RecipeFiltersContext";

const FilterDrawer = () => {
  const { 
    isFilterDrawerOpen, 
    setIsFilterDrawerOpen,
    categoryFilter,
    setCategoryFilter,
    maxTimeInMinutes,
    setMaxTimeInMinutes
  } = useRecipeFilters();

  const handleTimeChange = (value: number[]) => {
    setMaxTimeInMinutes(value[0] === 180 ? null : value[0]);
  };

  const resetFilters = () => {
    setCategoryFilter("all");
    setMaxTimeInMinutes(null);
  };

  const CategoryButton = ({ 
    value, 
    icon: Icon, 
    label, 
    colorClass 
  }: { 
    value: string, 
    icon: React.ElementType, 
    label: string, 
    colorClass: string 
  }) => (
    <Button 
      variant={categoryFilter === value ? "sunshine" : "outline"} 
      size="sm" 
      className={`whitespace-nowrap ${categoryFilter !== value ? colorClass : ''} group rounded-full`}
      onClick={() => setCategoryFilter(value as any)}
    >
      <Icon className="h-4 w-4 mr-1 group-hover:animate-bounce" />
      <span className="group-hover:font-bold transition-all">{label}</span>
    </Button>
  );

  return (
    <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Recipe Filters</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium mb-3">Category</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            <CategoryButton 
              value="all" 
              icon={UtensilsCrossed} 
              label="All" 
              colorClass="" 
            />
            <CategoryButton 
              value="breakfast" 
              icon={Coffee} 
              label="Breakfast" 
              colorClass="bg-sunshine-100 text-charcoal-700 border border-sunshine-300 hover:bg-sunshine-200" 
            />
            <CategoryButton 
              value="lunch" 
              icon={Salad} 
              label="Lunch" 
              colorClass="bg-ocean-100 text-charcoal-700 border border-ocean-300 hover:bg-ocean-200" 
            />
            <CategoryButton 
              value="dinner" 
              icon={ChefHat} 
              label="Dinner" 
              colorClass="bg-seafoam-100 text-charcoal-700 border border-seafoam-300 hover:bg-seafoam-200" 
            />
            <CategoryButton 
              value="desserts" 
              icon={Cake} 
              label="Desserts" 
              colorClass="bg-berry-100 text-charcoal-700 border border-berry-300 hover:bg-berry-200" 
            />
            <CategoryButton 
              value="snacks" 
              icon={Pizza} 
              label="Snacks" 
              colorClass="bg-sunshine-100 text-charcoal-700 border border-sunshine-300 hover:bg-sunshine-200" 
            />
          </div>
          
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Cooking Time</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {maxTimeInMinutes === null ? "Any time" : `${maxTimeInMinutes} min or less`}
            </span>
          </h3>
          <div className="px-1 py-4">
            <Slider
              defaultValue={[maxTimeInMinutes || 180]}
              max={180}
              min={5}
              step={5}
              onValueChange={handleTimeChange}
              value={[maxTimeInMinutes || 180]}
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>5 min</span>
              <span>3 hours+</span>
            </div>
          </div>
        </div>
        
        <DrawerFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetFilters} className="flex-1">Reset</Button>
            <Button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1">Apply</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;

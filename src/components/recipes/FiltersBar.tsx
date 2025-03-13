
import { Button } from "@/components/ui/button";
import { Clock, Filter, Coffee, Salad, ChefHat, Cake, Pizza, UtensilsCrossed } from "lucide-react";

interface FiltersBarProps {
  onFilterClick: () => void;
}

const FiltersBar = ({ onFilterClick }: FiltersBarProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-3 pb-4 scrollbar-none">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onFilterClick}
        className="flex items-center whitespace-nowrap border-2 rounded-full bg-background group"
      >
        <Filter className="h-4 w-4 mr-1 group-hover:animate-pulse-slow" />
        <span className="group-hover:font-bold transition-all">Filters</span>
      </Button>
      
      <Button variant="sunshine" size="sm" className="whitespace-nowrap group rounded-full">
        <UtensilsCrossed className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
        <span className="group-hover:scale-105 transition-transform inline-block">All</span>
      </Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-sunshine-100 text-charcoal-700 border border-sunshine-300 hover:bg-sunshine-200 group rounded-full">
        <Coffee className="h-4 w-4 mr-1 group-hover:animate-bounce" />
        <span className="group-hover:font-bold transition-all">Breakfast</span>
      </Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-ocean-100 text-charcoal-700 border border-ocean-300 hover:bg-ocean-200 group rounded-full">
        <Salad className="h-4 w-4 mr-1 group-hover:animate-pulse-slow" />
        <span className="group-hover:font-bold transition-all">Lunch</span>
      </Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-seafoam-100 text-charcoal-700 border border-seafoam-300 hover:bg-seafoam-200 group rounded-full">
        <ChefHat className="h-4 w-4 mr-1 group-hover:animate-bounce" />
        <span className="group-hover:font-bold transition-all">Dinner</span>
      </Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-berry-100 text-charcoal-700 border border-berry-300 hover:bg-berry-200 group rounded-full">
        <Cake className="h-4 w-4 mr-1 group-hover:animate-pulse-slow" />
        <span className="group-hover:font-bold transition-all">Desserts</span>
      </Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-sunshine-100 text-charcoal-700 border border-sunshine-300 hover:bg-sunshine-200 group rounded-full">
        <Pizza className="h-4 w-4 mr-1 group-hover:animate-bounce" />
        <span className="group-hover:font-bold transition-all">Snacks</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center whitespace-nowrap bg-seafoam-100 text-charcoal-700 border border-seafoam-300 hover:bg-seafoam-200 group rounded-full"
      >
        <Clock className="h-4 w-4 mr-1 group-hover:animate-spin-slow" />
        <span className="group-hover:font-bold transition-all">Quick</span>
      </Button>
    </div>
  );
};

export default FiltersBar;

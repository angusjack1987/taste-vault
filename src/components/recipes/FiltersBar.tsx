
import { Button } from "@/components/ui/button";
import { Clock, Filter } from "lucide-react";

interface FiltersBarProps {
  onFilterClick: () => void;
}

const FiltersBar = ({ onFilterClick }: FiltersBarProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onFilterClick}
        className="flex items-center whitespace-nowrap border-2 border-primary bg-background"
      >
        <Filter className="h-4 w-4 mr-1" />
        Filters
      </Button>
      
      <Button variant="sunshine" size="sm" className="whitespace-nowrap">All Recipes</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-sunshine-100 text-charcoal-700 border border-sunshine-300">Breakfast</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-ocean-100 text-charcoal-700 border border-ocean-300">Lunch</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-seafoam-100 text-charcoal-700 border border-seafoam-300">Dinner</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-berry-100 text-charcoal-700 border border-berry-300">Desserts</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-sunshine-100 text-charcoal-700 border border-sunshine-300">Snacks</Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center whitespace-nowrap bg-seafoam-100 text-charcoal-700 border border-seafoam-300"
      >
        <Clock className="h-4 w-4 mr-1" />
        Quick (&lt; 30min)
      </Button>
    </div>
  );
};

export default FiltersBar;

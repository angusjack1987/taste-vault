
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
        className="flex items-center whitespace-nowrap"
      >
        <Filter className="h-4 w-4 mr-1" />
        Filters
      </Button>
      
      <Button variant="outline" size="sm" className="whitespace-nowrap">All Recipes</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Breakfast</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Lunch</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Dinner</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Desserts</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Snacks</Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center whitespace-nowrap"
      >
        <Clock className="h-4 w-4 mr-1" />
        Quick (< 30min)
      </Button>
    </div>
  );
};

export default FiltersBar;

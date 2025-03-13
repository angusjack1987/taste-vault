
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
      
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-lemon-100 text-charcoal-700 border border-lemon-300">All Recipes</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-cream-100 text-charcoal-700 border border-cream-300">Breakfast</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-sky-100 text-charcoal-700 border border-sky-300">Lunch</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-mint-100 text-charcoal-700 border border-mint-300">Dinner</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-lemon-100 text-charcoal-700 border border-lemon-300">Desserts</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap bg-cream-100 text-charcoal-700 border border-cream-300">Snacks</Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center whitespace-nowrap bg-mint-100 text-charcoal-700 border border-mint-300"
      >
        <Clock className="h-4 w-4 mr-1" />
        Quick (&lt; 30min)
      </Button>
    </div>
  );
};

export default FiltersBar;

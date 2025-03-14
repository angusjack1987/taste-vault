
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useRecipeFilters } from "@/contexts/RecipeFiltersContext";

const FiltersBar = () => {
  const { setIsFilterDrawerOpen, categoryFilter, maxTimeInMinutes } = useRecipeFilters();

  const handleFilterClick = () => {
    setIsFilterDrawerOpen(true);
  };

  // Build filter badge text
  const getFilterSummary = () => {
    const filters = [];
    
    if (categoryFilter !== "all") {
      filters.push(categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1));
    }
    
    if (maxTimeInMinutes !== null) {
      filters.push(`≤ ${maxTimeInMinutes} min`);
    }
    
    if (filters.length === 0) return null;
    
    return filters.join(", ");
  };

  const filterSummary = getFilterSummary();
  const hasActiveFilters = !!filterSummary;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-3 pb-4 scrollbar-none">
      <Button 
        variant={hasActiveFilters ? "secondary" : "outline"}
        size="sm" 
        onClick={handleFilterClick}
        className="flex items-center whitespace-nowrap border-2 rounded-full bg-background group"
      >
        <Filter className="h-4 w-4 mr-1 group-hover:animate-pulse-slow" />
        <span className="group-hover:font-bold transition-all">
          {hasActiveFilters ? `Filters: ${filterSummary}` : "Filters"}
        </span>
      </Button>
    </div>
  );
};

export default FiltersBar;

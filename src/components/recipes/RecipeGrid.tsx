
import { useState, useEffect } from "react";
import RecipeCard, { RecipeCardProps } from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeGridProps {
  recipes: RecipeCardProps[];
  emptyMessage?: string;
  isLoading?: boolean;
}

const RecipeGrid = ({ 
  recipes, 
  emptyMessage = "No recipes found", 
  isLoading = false 
}: RecipeGridProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted transition-all duration-300 hover:border-primary/30 hover:bg-muted/30">
        <p className="text-muted-foreground font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${mounted ? 'animate-in fade-in duration-500' : 'opacity-0'}`}>
      {recipes.map((recipe, index) => (
        <div 
          key={recipe.id} 
          className="transition-all duration-500" 
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            opacity: mounted ? 1 : 0
          }}
        >
          <RecipeCard {...recipe} />
        </div>
      ))}
    </div>
  );
};

export default RecipeGrid;

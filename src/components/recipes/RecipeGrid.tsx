
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import RecipeCard from "./RecipeCard";

export type GridRecipe = {
  id: string;
  title: string;
  image: string;
  time?: number;
  rating?: number;
  selected?: boolean;
  onSelect?: () => void;
};

type RecipeGridProps = {
  recipes: GridRecipe[];
  emptyMessage?: string;
  selectionMode?: boolean;
};

const RecipeGrid = ({ 
  recipes, 
  emptyMessage = "No recipes found", 
  selectionMode = false 
}: RecipeGridProps) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="relative">
          {selectionMode && (
            <div 
              className="absolute top-2 left-2 z-10 bg-background/80 rounded-full p-0.5 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (recipe.onSelect) recipe.onSelect();
              }}
            >
              <Checkbox 
                checked={recipe.selected} 
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
          )}
          
          {selectionMode ? (
            <div 
              onClick={() => recipe.onSelect && recipe.onSelect()}
              className="cursor-pointer"
            >
              <RecipeCard
                title={recipe.title}
                image={recipe.image}
                time={recipe.time}
                rating={recipe.rating}
              />
            </div>
          ) : (
            <Link to={`/recipes/${recipe.id}`}>
              <RecipeCard
                title={recipe.title}
                image={recipe.image}
                time={recipe.time}
                rating={recipe.rating}
              />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecipeGrid;

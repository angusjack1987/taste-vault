
import RecipeCard, { RecipeCardProps } from "./RecipeCard";

interface RecipeGridProps {
  recipes: RecipeCardProps[];
  emptyMessage?: string;
}

const RecipeGrid = ({ recipes, emptyMessage = "No recipes found" }: RecipeGridProps) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
        <p className="text-muted-foreground font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} />
      ))}
    </div>
  );
};

export default RecipeGrid;


import RecipeCard, { RecipeCardProps } from "./RecipeCard";

interface RecipeGridProps {
  recipes: RecipeCardProps[];
  emptyMessage?: string;
}

const RecipeGrid = ({ recipes, emptyMessage = "No recipes found" }: RecipeGridProps) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} />
      ))}
    </div>
  );
};

export default RecipeGrid;

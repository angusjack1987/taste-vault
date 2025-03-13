
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import RecipeCard, { RecipeCardProps } from "./RecipeCard";

interface CategorySectionProps {
  title: string;
  recipes: RecipeCardProps[];
  viewAllLink?: string;
  emptyMessage?: string;
}

const CategorySection = ({
  title,
  recipes,
  viewAllLink,
  emptyMessage = "No recipes found",
}: CategorySectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-primary text-sm flex items-center"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground bg-muted rounded-md">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;


import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import RecipeCard, { RecipeCardProps } from "./RecipeCard";
import { ReactNode } from "react";

interface CategorySectionProps {
  title: ReactNode; // Changed from string to ReactNode to support rich titles
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
        <h2 className="section-title font-bold text-xl flex items-center">
          {title}
        </h2>
        
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-secondary hover:text-secondary/80 text-sm flex items-center transition-colors group"
          >
            View all <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-10 px-6 text-muted-foreground bg-muted rounded-xl border-2 border-border">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-3 animate-bounce-light">🍽️</span>
            {emptyMessage}
          </div>
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

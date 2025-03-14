
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
    <section className="mb-8 relative z-10">
      <div className="flex items-center justify-between mb-6 p-2 bg-white border-2 border-black">
        <h2 className="section-title font-black uppercase text-xl flex items-center">
          {title}
        </h2>
        
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-black hover:text-primary text-sm font-bold uppercase flex items-center transition-colors neo-border px-2 py-1 bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-10 px-6 text-black bg-white border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-3 animate-neo-pulse">🍽️</span>
            <span className="font-bold uppercase">{emptyMessage}</span>
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

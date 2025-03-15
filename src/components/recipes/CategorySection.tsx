
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
  // Create a rotating color scheme for different sections
  const sectionColors = [
    "bg-gradient-to-r from-yellow-300 to-amber-300", // Yellow/amber for first section
    "bg-gradient-to-r from-red-300 to-orange-300",   // Red/orange for second section
    "bg-gradient-to-r from-green-300 to-teal-300",   // Green/teal for third section
  ];
  
  // Randomly select a color scheme
  const colorIndex = Math.floor(Math.random() * sectionColors.length);
  const sectionColor = sectionColors[colorIndex];
  
  return (
    <section className="mb-6 relative z-10 transform transition-all hover:-translate-y-1 duration-300">
      <div className={`flex items-center justify-between mb-4 p-3 ${sectionColor} rounded-xl border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]`}>
        <h2 className="section-title font-black uppercase text-lg md:text-xl flex items-center text-black m-0">
          {title}
        </h2>
        
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-black hover:text-primary text-xs md:text-sm font-bold uppercase flex items-center transition-colors neo-border px-2 py-1 bg-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        )}
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-8 px-4 text-black section-pink rounded-xl border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2 animate-character">🍽️</span>
            <span className="font-bold uppercase">{emptyMessage}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;

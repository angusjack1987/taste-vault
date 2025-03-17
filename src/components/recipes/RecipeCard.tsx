
import { Clock, Star, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  time?: number; // in minutes
  rating?: number;
  className?: string;
}

const RecipeCard = ({
  id,
  title,
  image,
  time,
  rating,
  className,
}: RecipeCardProps) => {
  // Generate a random vibrant background color for placeholder images
  const placeholderColors = [
    'bg-yellow-400', 'bg-orange-400', 'bg-red-400', 
    'bg-green-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400'
  ];
  const randomColor = placeholderColors[Math.floor(Math.random() * placeholderColors.length)];

  return (
    <Link to={`/recipes/${id}`} className={cn("block group", className)}>
      <div className="rounded-xl overflow-hidden border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5">
        <div className="aspect-[4/3] w-full relative overflow-hidden border-b-2 border-black">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full ${randomColor} flex items-center justify-center`}>
              <Utensils className="h-10 w-10 text-white" />
            </div>
          )}
          {rating && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-lg p-1 px-2 flex items-center text-xs font-medium uppercase border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
              <Star className="w-3 h-3 mr-0.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-2">
          <h3 className="font-heading font-medium uppercase text-sm line-clamp-2 min-h-[2.5rem] transition-all group-hover:text-primary">{title}</h3>
          
          {time && (
            <div className="mt-1 flex items-center text-black text-xs font-medium uppercase">
              <Clock className="w-3 h-3 mr-1" />
              <span>{time} min</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;

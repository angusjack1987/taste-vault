
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
  return (
    <Link to={`/recipes/${id}`} className={cn("block group", className)}>
      <div className="rounded-none overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1">
        <div className="aspect-[4/3] w-full relative overflow-hidden border-b-2 border-black">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-yellow-200 flex items-center justify-center">
              <Utensils className="h-12 w-12 text-black" />
            </div>
          )}
          {rating && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-none p-1 px-2 flex items-center text-xs font-extrabold uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Star className="w-3 h-3 mr-0.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-heading font-extrabold uppercase text-sm line-clamp-1 transition-all group-hover:text-primary">{title}</h3>
          
          {time && (
            <div className="mt-1 flex items-center text-black text-xs font-bold uppercase">
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

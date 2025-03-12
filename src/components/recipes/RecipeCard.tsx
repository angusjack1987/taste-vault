
import { Clock, Star } from "lucide-react";
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
    <Link to={`/recipes/${id}`} className={cn("recipe-card block", className)}>
      <div className="aspect-[4/3] w-full relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 flex items-center text-xs">
            <Star className="w-3 h-3 mr-0.5 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
        
        {time && (
          <div className="mt-1 flex items-center text-muted-foreground text-xs">
            <Clock className="w-3 h-3 mr-1" />
            <span>{time} min</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;


import { Clock, Star, ImageIcon, Utensils } from "lucide-react";
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
    <Link to={`/recipes/${id}`} className={cn("block", className)}>
      <div className="rounded-2xl overflow-hidden border-2 border-border shadow-sm bg-background transition-all duration-300 hover:shadow-vibrant hover:-translate-y-1 hover:border-sunshine-500 group">
        <div className="aspect-[4/3] w-full relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Utensils className="h-16 w-16 text-muted-foreground opacity-40 animate-pulse-slow" />
            </div>
          )}
          {rating && (
            <div className="absolute top-2 right-2 bg-sunshine-500 text-charcoal-800 rounded-full p-1 flex items-center text-xs font-bold shadow-sm group-hover:animate-bounce">
              <Star className="w-3 h-3 mr-0.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-heading font-bold text-sm line-clamp-1">{title}</h3>
          
          {time && (
            <div className="mt-1 flex items-center text-seafoam-600 text-xs font-medium">
              <Clock className="w-3 h-3 mr-1 group-hover:animate-spin-slow" />
              <span>{time} min</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;

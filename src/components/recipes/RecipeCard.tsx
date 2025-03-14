
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
      <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm bg-background transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="aspect-[4/3] w-full relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-sage-50 flex items-center justify-center">
              <Utensils className="h-12 w-12 text-sage-300" />
            </div>
          )}
          {rating && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 px-2 flex items-center text-xs font-bold shadow-sm">
              <Star className="w-3 h-3 mr-0.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-heading font-bold text-sm line-clamp-1 transition-all group-hover:text-primary">{title}</h3>
          
          {time && (
            <div className="mt-1 flex items-center text-muted-foreground text-xs font-medium">
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

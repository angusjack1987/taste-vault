
import { Clock, Star, ImageIcon } from "lucide-react";
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
      <div className="rounded-2xl overflow-hidden border-2 border-border shadow-sm bg-background transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-secondary">
        <div className="aspect-[4/3] w-full relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground opacity-40" />
            </div>
          )}
          {rating && (
            <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground rounded-full p-1 flex items-center text-xs font-bold shadow-sm">
              <Star className="w-3 h-3 mr-0.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-bold text-sm line-clamp-1">{title}</h3>
          
          {time && (
            <div className="mt-1 flex items-center text-mint-700 text-xs font-medium">
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

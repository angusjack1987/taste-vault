import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import RecipeCard from "./RecipeCard";
export type GridRecipe = {
  id: string;
  title: string;
  image: string;
  time?: number;
  rating?: number;
  selected?: boolean;
  onSelect?: () => void;
};
type RecipeGridProps = {
  recipes: GridRecipe[];
  emptyMessage?: string;
  selectionMode?: boolean;
};
const RecipeGrid = ({
  recipes,
  emptyMessage = "No recipes found",
  selectionMode = false
}: RecipeGridProps) => {
  if (recipes.length === 0) {
    return <div className="text-center py-10 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
        <span className="text-4xl mb-3 block animate-neo-pulse">🍳</span>
        <span className="font-bold uppercase">{emptyMessage}</span>
      </div>;
  }
  return <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mx-[4px] my-0">
      {recipes.map(recipe => <div key={recipe.id} className="relative">
          {selectionMode && <div className="absolute top-2 left-2 z-10 bg-white border-1 border-black p-1 cursor-pointer rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]" onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        if (recipe.onSelect) recipe.onSelect();
      }}>
              <Checkbox checked={recipe.selected} className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
            </div>}
          
          {selectionMode ? <div onClick={() => recipe.onSelect && recipe.onSelect()} className="cursor-pointer">
              <RecipeCard id={recipe.id} title={recipe.title} image={recipe.image} time={recipe.time} rating={recipe.rating} />
            </div> : <RecipeCard id={recipe.id} title={recipe.title} image={recipe.image} time={recipe.time} rating={recipe.rating} />}
        </div>)}
    </div>;
};
export default RecipeGrid;
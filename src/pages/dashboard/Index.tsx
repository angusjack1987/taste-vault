
import { Plus, Loader2, ChefHat, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import CategorySection from "@/components/recipes/CategorySection";
import useRecipes from "@/hooks/useRecipes";

const Dashboard = () => {
  const { useAllRecipes } = useRecipes();
  const { data: recipes, isLoading } = useAllRecipes();
  
  const formattedRecipes = recipes?.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || "",
    time: recipe.time || undefined,
    rating: undefined,
  })) || [];
  
  const recentlyAdded = [...(formattedRecipes || [])].slice(0, 3);
  
  const favorites = formattedRecipes.slice(0, 3);
  const popular = formattedRecipes.slice(0, 4);
  
  const emptyStateMessage = "You haven't created any recipes yet. Click the + button to add your first recipe!";
  
  return (
    <MainLayout title="Flavor Librarian">
      <div className="page-container">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes?.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-xl bg-gradient-to-b from-cream-50 to-cream-100 border-2 border-cream-200">
            <ChefHat className="h-16 w-16 mx-auto mb-4 text-secondary animate-bounce" />
            <p className="text-lg mb-4">{emptyStateMessage}</p>
            <Link to="/recipes/new" className="mt-4 inline-block">
              <Button className="rounded-full px-6 py-5 shadow-md hover:shadow-lg transition-all bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="h-5 w-5 mr-2" />
                Create First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {recentlyAdded.length > 0 && (
              <CategorySection 
                title={<span>Recently Added <span className="text-sm font-normal text-mint-600 ml-2">Fresh & New</span></span>}
                recipes={recentlyAdded} 
                viewAllLink="/recipes?sort=newest"
              />
            )}
            
            {favorites.length > 0 && (
              <CategorySection 
                title={<span>Favorites <span className="text-sm font-normal text-cream-700 ml-2">Your Top Picks</span></span>}
                recipes={favorites} 
                viewAllLink="/recipes?filter=favorites"
              />
            )}
            
            {popular.length > 0 && (
              <CategorySection 
                title={
                  <div className="flex items-center">
                    <span>Popular Recipes</span>
                    <Sparkles className="h-4 w-4 text-secondary ml-2" />
                  </div>
                }
                recipes={popular} 
                viewAllLink="/recipes?sort=popular"
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;

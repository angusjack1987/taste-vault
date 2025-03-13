
import { Plus, Loader2, BookPlus, ShoppingCart, Refrigerator } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import CategorySection from "@/components/recipes/CategorySection";
import useRecipes from "@/hooks/useRecipes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Dashboard = () => {
  const { useAllRecipes } = useRecipes();
  const { data: recipes, isLoading } = useAllRecipes();
  
  // Format recipes for grid display
  const formattedRecipes = recipes?.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || "",
    time: recipe.time || undefined,
    rating: undefined, // No ratings yet
  })) || [];
  
  // Get the latest recipes for the "Recently Added" section
  const recentlyAdded = [...(formattedRecipes || [])].slice(0, 3);
  
  // For now, favorites and popular are the same as all recipes
  // In the future, these could be filtered based on actual favorites/popularity
  const favorites = formattedRecipes.slice(0, 3);
  const popular = formattedRecipes.slice(0, 4);
  
  const emptyStateMessage = "You haven't created any recipes yet. Click the + button to add your first recipe!";
  
  return (
    <MainLayout title="Flavor Librarian">
      <div className="page-container">
        {/* Today's Meal section */}
        <section className="mb-8">
          <h2 className="section-title">Today's Meal Plan</h2>
          <div className="bg-muted rounded-xl p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Breakfast</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center">
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Breakfast
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Lunch</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center">
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lunch
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Dinner</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center">
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Dinner
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link to="/meal-plan">
                <Button variant="outline" size="sm">View Full Plan</Button>
              </Link>
            </div>
          </div>
        </section>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{emptyStateMessage}</p>
            <Link to="/recipes/new" className="mt-4 inline-block">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {recentlyAdded.length > 0 && (
              <CategorySection 
                title="Recently Added" 
                recipes={recentlyAdded} 
                viewAllLink="/recipes?sort=newest"
              />
            )}
            
            {favorites.length > 0 && (
              <CategorySection 
                title="Favorites" 
                recipes={favorites} 
                viewAllLink="/recipes?filter=favorites"
              />
            )}
            
            {popular.length > 0 && (
              <CategorySection 
                title="Popular Recipes" 
                recipes={popular} 
                viewAllLink="/recipes?sort=popular"
              />
            )}
          </>
        )}
        
        <div className="fixed bottom-24 right-6 z-20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
                  <Plus className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="end" className="flex flex-col p-0 rounded-lg overflow-hidden">
                <Link to="/recipes/new">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start w-full px-3 py-2 h-auto text-sm gap-2 rounded-none hover:bg-accent"
                  >
                    <BookPlus className="h-4 w-4" />
                    Add Recipe
                  </Button>
                </Link>
                <Link to="/fridge">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start w-full px-3 py-2 h-auto text-sm gap-2 rounded-none hover:bg-accent"
                  >
                    <Refrigerator className="h-4 w-4" />
                    Fridge
                  </Button>
                </Link>
                <Link to="/shopping">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start w-full px-3 py-2 h-auto text-sm gap-2 rounded-none hover:bg-accent"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Shopping List
                  </Button>
                </Link>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

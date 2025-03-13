
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
        <section className="mb-8">
          <h2 className="section-title flex items-center gap-2 mb-3">
            <ChefHat className="h-5 w-5 text-secondary" />
            <span>Today's Meal Plan</span>
          </h2>
          <div className="bg-gradient-to-br from-cream-50 to-cream-100 rounded-xl p-5 border-2 border-cream-200 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Breakfast</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border-2 border-dashed border-secondary/50 flex items-center justify-center hover:border-secondary hover:bg-secondary/5 transition-colors">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Breakfast
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Lunch</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border-2 border-dashed border-mint-400/50 flex items-center justify-center hover:border-mint-400 hover:bg-mint-50 transition-colors">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lunch
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Dinner</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border-2 border-dashed border-sky-300/50 flex items-center justify-center hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Dinner
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link to="/meal-plan">
                <Button variant="outline" size="sm" className="rounded-full hover:shadow-sm transition-all">View Full Plan</Button>
              </Link>
            </div>
          </div>
        </section>
        
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


import { Plus, Loader2 } from "lucide-react";
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
      </div>
    </MainLayout>
  );
};

export default Dashboard;

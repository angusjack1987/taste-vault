
import { Plus, Loader2, Sparkles, ChefHat, ClipboardCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import CategorySection from "@/components/recipes/CategorySection";
import useRecipes from "@/hooks/useRecipes";
import { Card, CardContent } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import useMealPlans from "@/hooks/useMealPlans";

const Dashboard = () => {
  const { user } = useAuth();
  const { useAllRecipes } = useRecipes();
  const { useTodaysMeals } = useMealPlans();
  
  const { data: recipes = [], isLoading: recipesLoading } = useAllRecipes();
  const { data: todaysMeals = [], isLoading: mealsLoading } = useTodaysMeals();
  
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
  
  // Calculate some stats for the dashboard
  const averageCookTime = recipes.length 
    ? Math.round(recipes.reduce((acc, recipe) => acc + (recipe.time || 0), 0) / recipes.length) 
    : 0;
  
  const totalCookingTime = recipes.reduce((acc, recipe) => acc + (recipe.time || 0), 0);
  
  const firstName = user?.user_metadata?.first_name || 'chef';
  
  return (
    <MainLayout title="Flavor Librarian">
      <div className="page-container">
        {/* Greeting and Stats Cards */}
        <section className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Welcome back, {firstName}!</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-lemon-500 hover-scale shadow-yellow">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ChefHat className="h-8 w-8 text-lemon-700 mb-2" />
                <p className="text-3xl font-bold text-lemon-800">{recipes.length}</p>
                <p className="text-sm font-medium text-muted-foreground">Recipes</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-mint-500 hover-scale shadow-green">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ClipboardCheck className="h-8 w-8 text-mint-700 mb-2" />
                <p className="text-3xl font-bold text-mint-800">{todaysMeals.length}</p>
                <p className="text-sm font-medium text-muted-foreground">Today's Meals</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-sky-500 hover-scale shadow-blue">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="h-8 w-8 text-sky-700 mb-2" />
                <p className="text-3xl font-bold text-sky-800">{averageCookTime}</p>
                <p className="text-sm font-medium text-muted-foreground">Avg. Cook Time</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-secondary hover-scale shadow-yellow">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Sparkles className="h-8 w-8 text-secondary mb-2" />
                <p className="text-3xl font-bold text-secondary">{totalCookingTime}</p>
                <p className="text-sm font-medium text-muted-foreground">Total Minutes</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="section-title flex items-center">
            <span className="highlight-yellow mr-2">Today's Meal Plan</span>
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
          </h2>
          
          <div className="bg-gradient-to-r from-cream-50 to-cream-200 rounded-xl p-4 border-2 border-cream-300">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-charcoal-600">Breakfast</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border-2 border-dashed border-lemon-400 bg-white/70 flex items-center justify-center transition-all hover:bg-lemon-50">
                    <Button variant="ghost" size="sm" className="text-lemon-700 hover:text-lemon-800 hover:bg-lemon-100">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Breakfast
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-charcoal-600">Lunch</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border-2 border-dashed border-mint-400 bg-white/70 flex items-center justify-center transition-all hover:bg-mint-50">
                    <Button variant="ghost" size="sm" className="text-mint-700 hover:text-mint-800 hover:bg-mint-100">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lunch
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-charcoal-600">Dinner</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border-2 border-dashed border-sky-400 bg-white/70 flex items-center justify-center transition-all hover:bg-sky-50">
                    <Button variant="ghost" size="sm" className="text-sky-700 hover:text-sky-800 hover:bg-sky-100">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Dinner
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link to="/meal-plan">
                <Button variant="outline" size="sm" className="bg-white hover:bg-lemon-50 border-lemon-400 text-charcoal-700 hover:text-charcoal-800">
                  View Full Plan
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {recipesLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes?.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-b from-cream-50 to-cream-200 rounded-xl border-2 border-cream-300">
            <Sparkles className="h-12 w-12 text-secondary mx-auto mb-4" />
            <p className="mb-4 text-lg font-medium">{emptyStateMessage}</p>
            <Link to="/recipes/new" className="mt-4 inline-block">
              <Button className="bg-secondary hover:bg-secondary/90 text-charcoal-800 font-medium shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Create First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {recentlyAdded.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-lemon-50 to-lemon-100 rounded-xl border-2 border-lemon-200">
                <CategorySection 
                  title={<span className="highlight-yellow">Recently Added</span>}
                  recipes={recentlyAdded} 
                  viewAllLink="/recipes?sort=newest"
                />
              </div>
            )}
            
            {favorites.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl border-2 border-mint-200">
                <CategorySection 
                  title={<span className="highlight-green">Favorites</span>}
                  recipes={favorites} 
                  viewAllLink="/recipes?filter=favorites"
                />
              </div>
            )}
            
            {popular.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl border-2 border-sky-200">
                <CategorySection 
                  title={<span className="highlight-blue">Popular Recipes</span>}
                  recipes={popular} 
                  viewAllLink="/recipes?sort=popular"
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;

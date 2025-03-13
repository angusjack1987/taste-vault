
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, ChefHat, User2, Calendar, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useRecipes from '@/hooks/useRecipes';
import useMealPlans from '@/hooks/useMealPlans';
import CategorySection from '@/components/recipes/CategorySection';
import SuggestMealDialog from '@/components/meal-plan/dialogs/SuggestMealDialog';
import useAiRecipes from '@/hooks/useAiRecipes';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';

const IndexPage = () => {
  const { user } = useAuth();
  const { useAllRecipes } = useRecipes();
  const { useTodaysMeals } = useMealPlans();
  const { suggestMealForPlan, loading: aiLoading } = useAiRecipes();
  
  const { data: recipes = [], isLoading: recipesLoading } = useAllRecipes();
  const { data: todaysMeals = [], isLoading: mealsLoading } = useTodaysMeals();

  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  const [suggestMealType, setSuggestMealType] = useState<"breakfast" | "lunch" | "dinner">("dinner");
  const [additionalPreferences, setAdditionalPreferences] = useState("");

  const recentRecipes = recipes.slice(0, 4);
  const popularRecipes = [...recipes].sort(() => 0.5 - Math.random()).slice(0, 4); // Random for demo
  
  const handleOpenSuggestDialog = () => {
    setSuggestDialogOpen(true);
  };

  const handleSuggestMeal = async () => {
    setParsingMealSuggestion(true);
    
    try {
      const result = await suggestMealForPlan({
        mealType: suggestMealType,
        additionalPreferences
      });
      
      try {
        // Try to parse the JSON from the AI response
        const parsedResult = JSON.parse(result);
        setSuggestedMeal(parsedResult);
      } catch (e) {
        // If parsing fails, use the raw response
        setSuggestedMeal({ rawResponse: result });
      }
    } catch (error) {
      console.error("Error suggesting meal:", error);
      setSuggestedMeal(null);
    } finally {
      setParsingMealSuggestion(false);
    }
  };

  const handleSaveSuggestedRecipe = async (optionIndex: number) => {
    // This would be implemented to save the selected recipe
    setSuggestDialogOpen(false);
    setSuggestedMeal(null);
  };

  const handleResetSuggestedMeal = () => {
    setSuggestedMeal(null);
  };

  return (
    <MainLayout title="Home">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-sage-600 to-sage-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
          <div className="relative py-12 px-6 text-white space-y-4 z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.user_metadata?.first_name || 'Chef'}!</h1>
            <p className="text-white/80 max-w-md">Your digital kitchen companion for meal planning, recipe management, and cooking inspiration.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button asChild className="bg-white hover:bg-white/90 text-sage-800">
                <Link to="/meal-plan">Plan Your Week</Link>
              </Button>
              
              <AiSuggestionButton
                onClick={handleOpenSuggestDialog}
                label="Get AI Recipe Ideas"
              />
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-sage-300/20 rounded-full blur-2xl"></div>
          <div className="absolute right-1/4 -top-12 w-40 h-40 bg-sage-100/20 rounded-full blur-xl"></div>
        </section>
        
        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center hover-scale">
            <div className="bg-sage-100 dark:bg-sage-900/30 p-3 rounded-full mb-3">
              <ChefHat className="text-sage-500 h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold">{recipes.length}</p>
            <p className="text-muted-foreground text-sm">Recipes</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center hover-scale">
            <div className="bg-sage-100 dark:bg-sage-900/30 p-3 rounded-full mb-3">
              <Calendar className="text-sage-500 h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold">{todaysMeals.length}</p>
            <p className="text-muted-foreground text-sm">Today's Meals</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center hover-scale">
            <div className="bg-sage-100 dark:bg-sage-900/30 p-3 rounded-full mb-3">
              <Clock className="text-sage-500 h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold">
              {recipes.length > 0 
                ? Math.round(recipes.reduce((acc, r) => acc + (r.time || 0), 0) / recipes.length) 
                : 0}
            </p>
            <p className="text-muted-foreground text-sm">Avg. Cook Time</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center relative overflow-hidden hover-scale">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 animate-pulse"></div>
            <div className="z-10 bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full mb-3">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold relative z-10">AI</p>
            <p className="text-muted-foreground text-sm relative z-10">Recipe Suggestions</p>
          </div>
        </section>
        
        {/* Recipe Sections */}
        <CategorySection 
          title="Recent Recipes" 
          recipes={recentRecipes}
          viewAllLink="/recipes"
          emptyMessage="No recipes yet. Start adding some!"
        />
        
        <CategorySection 
          title="Popular Recipes" 
          recipes={popularRecipes}
          viewAllLink="/recipes"
          emptyMessage="Explore more recipes to see popular ones!"
        />
      </div>

      <SuggestMealDialog
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        currentDay={null}
        currentMealType={null}
        suggestMealType={suggestMealType}
        setSuggestMealType={setSuggestMealType}
        aiLoading={aiLoading}
        suggestedMeal={suggestedMeal}
        parsingMealSuggestion={parsingMealSuggestion}
        additionalPreferences={additionalPreferences}
        setAdditionalPreferences={setAdditionalPreferences}
        onSuggestMeal={handleSuggestMeal}
        onSaveSuggestedRecipe={handleSaveSuggestedRecipe}
        onResetSuggestedMeal={handleResetSuggestedMeal}
      />
    </MainLayout>
  );
};

export default IndexPage;

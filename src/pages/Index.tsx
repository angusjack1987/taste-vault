import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, ChefHat, Calendar, Sparkles, Utensils, ArrowRight, Brain, Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useRecipes from '@/hooks/useRecipes';
import useMealPlans from '@/hooks/useMealPlans';
import CategorySection from '@/components/recipes/CategorySection';
import SuggestMealDialog from '@/components/meal-plan/dialogs/SuggestMealDialog';
import useAiRecipes from '@/hooks/useAiRecipes';
import useAiMemory from '@/hooks/useAiMemory';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import AiMemoryDialog from '@/components/meal-plan/dialogs/AiMemoryDialog';

const IndexPage = () => {
  const { user } = useAuth();
  const { useAllRecipes } = useRecipes();
  const { useTodaysMeals } = useMealPlans();
  const { suggestMealForPlan, loading: aiLoading } = useAiRecipes();
  const { getMemoryInsights, insights, loading: memoryLoading, isMemoryEnabled } = useAiMemory();
  
  const { data: recipes = [], isLoading: recipesLoading } = useAllRecipes();
  const { data: todaysMeals = [], isLoading: mealsLoading } = useTodaysMeals();

  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [memoryDialogOpen, setMemoryDialogOpen] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<any>(null);
  const [parsingMealSuggestion, setParsingMealSuggestion] = useState(false);
  const [suggestMealType, setSuggestMealType] = useState<"breakfast" | "lunch" | "dinner">("dinner");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [memoryPreview, setMemoryPreview] = useState<string | null>(null);

  const recentRecipes = recipes.slice(0, 4);
  const popularRecipes = [...recipes].sort(() => 0.5 - Math.random()).slice(0, 4); // Random for demo
  
  useEffect(() => {
    if (user && isMemoryEnabled && !insights && !memoryLoading) {
      console.log("Fetching memory insights");
      getMemoryInsights().then(insights => {
        if (insights) {
          const firstParagraph = insights.split('\n\n')[0];
          setMemoryPreview(firstParagraph);
          console.log("Memory preview set:", firstParagraph);
        }
      });
    }
  }, [user, isMemoryEnabled, insights, memoryLoading, getMemoryInsights]);

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
        const parsedResult = JSON.parse(result);
        setSuggestedMeal(parsedResult);
      } catch (e) {
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
    setSuggestDialogOpen(false);
    setSuggestedMeal(null);
  };

  const handleResetSuggestedMeal = () => {
    setSuggestedMeal(null);
  };

  const firstName = user?.user_metadata?.first_name || 'friend';

  return (
    <MainLayout title="Flavor Librarian">
      <div className="space-y-8 px-4">
        <section className="mt-6">
          <h1 className="text-2xl font-bold mb-1">Good day, {firstName}!</h1>
          <p className="text-3xl font-bold mb-6">What shall we cook today?</p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link to="/recipes" className="block">
              <div className="stat-card stat-card-yellow rounded-2xl h-full">
                <Utensils className="h-6 w-6 mb-2" />
                <p className="stat-card-icon">{recipes.length}</p>
                <p className="stat-card-label">Recipes</p>
              </div>
            </Link>
            
            <Link to="/meal-plan" className="block">
              <div className="stat-card stat-card-green rounded-2xl h-full">
                <Calendar className="h-6 w-6 mb-2" />
                <p className="stat-card-icon">{todaysMeals.length}</p>
                <p className="stat-card-label">Today's Meals</p>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/recipes" className="block">
              <div className="stat-card stat-card-blue rounded-2xl h-full">
                <Clock className="h-6 w-6 mb-2" />
                <p className="stat-card-icon">
                  {recipes.length > 0 
                    ? Math.round(recipes.reduce((acc, r) => acc + (r.time || 0), 0) / recipes.length) 
                    : 0}
                </p>
                <p className="stat-card-label">Avg. Cook Time</p>
              </div>
            </Link>
            
            <button onClick={handleOpenSuggestDialog} className="block w-full">
              <div className="stat-card stat-card-black rounded-2xl h-full">
                <Sparkles className="h-6 w-6 mb-2" />
                <p className="stat-card-icon">AI</p>
                <p className="stat-card-label">Recipe Ideas</p>
              </div>
            </button>
          </div>
        </section>
        
        {isMemoryEnabled && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Cooking Insights</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMemoryDialogOpen(true)}
                className="text-sm font-medium flex items-center"
              >
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="playful-card bg-primary/10 border-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                {memoryLoading ? (
                  <div className="flex items-center gap-2 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p>Loading your cooking insights...</p>
                  </div>
                ) : memoryPreview ? (
                  <>
                    <p className="text-base">{memoryPreview}</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setMemoryDialogOpen(true)}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      See Full Insights
                    </Button>
                  </>
                ) : (
                  <div className="py-3">
                    <p>No insights available yet. Keep using the app to get personalized cooking insights!</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => getMemoryInsights()}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </div>
              <div className="absolute top-[-20px] right-[-20px] opacity-10">
                <Brain className="h-32 w-32 text-primary" />
              </div>
            </div>
          </section>
        )}
        
        {todaysMeals.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Today's Meals</h2>
              <Link to="/meal-plan" className="text-sm font-medium flex items-center">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="playful-card">
              {todaysMeals.map((meal) => (
                <div key={meal.id} className="mb-3 last:mb-0">
                  <h3 className="font-medium text-sm text-muted-foreground capitalize mb-1">
                    {meal.meal_type}
                  </h3>
                  {meal.recipe ? (
                    <Link to={`/recipes/${meal.recipe.id}`} className="block">
                      <div className="flex items-center gap-3">
                        {meal.recipe.image ? (
                          <img 
                            src={meal.recipe.image} 
                            alt={meal.recipe.title}
                            className="w-12 h-12 rounded-lg object-cover" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <ChefHat className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{meal.recipe.title}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link to="/meal-plan" className="block">
                      <div className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center">
                        <Button variant="ghost" size="sm" className="rounded-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Add {meal.meal_type}
                        </Button>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
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
        
        <section className="mb-10">
          <div className="playful-card bg-secondary/10 border-secondary/30">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="h-10 w-10 text-secondary mb-3" />
              <h2 className="text-xl font-bold mb-2">AI Recipe Assistant</h2>
              <p className="text-muted-foreground mb-4">
                Need inspiration? Let our AI chef suggest personalized recipes based on your preferences.
              </p>
              
              <AiSuggestionButton
                onClick={handleOpenSuggestDialog}
                label="Get Recipe Ideas"
                className="rounded-full"
              />
            </div>
          </div>
        </section>
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

      <AiMemoryDialog
        open={memoryDialogOpen}
        onOpenChange={setMemoryDialogOpen}
      />
    </MainLayout>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default IndexPage;

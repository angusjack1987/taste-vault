
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import useAuth from '@/hooks/useAuth';
import useRecipes from '@/hooks/useRecipes';
import useMealPlans from '@/hooks/useMealPlans';
import CategorySection from '@/components/recipes/CategorySection';
import SuggestMealDialog from '@/components/meal-plan/dialogs/SuggestMealDialog';
import useAiRecipes from '@/hooks/useAiRecipes';
import useAiMemory from '@/hooks/useAiMemory';
import AiMemoryDialog from '@/components/meal-plan/dialogs/AiMemoryDialog';

// Import the new component files
import HeroSection from '@/components/home/HeroSection';
import MemoryInsightsSection from '@/components/home/MemoryInsightsSection';
import TodaysMealsSection from '@/components/home/TodaysMealsSection';
import AiChefSection from '@/components/home/AiChefSection';

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
  
  // Calculate average cook time
  const avgCookTime = recipes.length > 0 
    ? Math.round(recipes.reduce((acc, r) => acc + (r.time || 0), 0) / recipes.length) 
    : 0;

  return (
    <MainLayout title="Flavor Librarian">
      <div className="space-y-8 px-4">
        {/* Hero Section */}
        <HeroSection 
          firstName={firstName}
          recipesCount={recipes.length}
          todaysMealsCount={todaysMeals.length}
          avgCookTime={avgCookTime}
          onOpenSuggestDialog={handleOpenSuggestDialog}
        />
        
        {/* Memory Insights Section */}
        <MemoryInsightsSection 
          memoryLoading={memoryLoading}
          memoryPreview={memoryPreview}
          isMemoryEnabled={isMemoryEnabled}
          onOpenMemoryDialog={() => setMemoryDialogOpen(true)}
          onGenerateInsights={getMemoryInsights}
        />
        
        {/* Today's Meals Section */}
        <TodaysMealsSection meals={todaysMeals} />
        
        {/* Recent Recipes Section */}
        <CategorySection 
          title="Recent Recipes" 
          recipes={recentRecipes}
          viewAllLink="/recipes"
          emptyMessage="No recipes yet. Start adding some!"
        />
        
        {/* Popular Recipes Section */}
        <CategorySection 
          title="Popular Recipes" 
          recipes={popularRecipes}
          viewAllLink="/recipes"
          emptyMessage="Explore more recipes to see popular ones!"
        />
        
        {/* AI Chef Section */}
        <AiChefSection onOpenSuggestDialog={handleOpenSuggestDialog} />
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

export default IndexPage;

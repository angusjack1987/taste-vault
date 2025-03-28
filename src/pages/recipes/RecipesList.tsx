
import { useState, useEffect } from "react";
import { Link, Plus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import useRecipes, { RecipeFormData, Recipe } from "@/hooks/useRecipes";
import RecipeCard from "@/components/recipes/RecipeCard";
import ImportRecipeDialog from "@/components/recipes/ImportRecipeDialog";
import RecipePhotoCapture from "@/components/recipes/RecipePhotoCapture";
import { useNavigate } from "react-router-dom";
import FiltersBar from "@/components/recipes/FiltersBar";
import FilterDrawer from "@/components/recipes/FilterDrawer";
import { RecipeFiltersProvider } from "@/contexts/RecipeFiltersContext";
import RecipeGrid from "@/components/recipes/RecipeGrid";

const RecipesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPhotoCaptureOpen, setIsPhotoCaptureOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { useRecipesWithFilters, useAddRecipe } = useRecipes();
  const { data, isLoading, error } = useRecipesWithFilters({
    title: searchQuery
  });
  
  const addRecipeMutation = useAddRecipe();
  
  // Explicitly type the recipes variable to ensure it's always an array
  const recipes: Recipe[] = data as Recipe[] || [];
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const handleImport = (recipeData: any) => {
    console.log("Importing recipe:", recipeData);
    
    if (recipeData.title) {
      // Create a new recipe
      addRecipeMutation.mutate(recipeData as RecipeFormData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Recipe saved successfully!",
            variant: "default"
          });
        },
        onError: (err) => {
          console.error("Error saving recipe:", err);
          toast({
            title: "Error",
            description: "Failed to save recipe. Please try again.",
            variant: "destructive"
          });
        }
      });
    } else {
      // Navigate to the recipe form with the extracted data
      navigate("/recipes/new", { state: { recipeData } });
    }
  };
  
  // Add the missing handleRecipeExtracted function
  const handleRecipeExtracted = (recipeData: Partial<RecipeFormData>) => {
    // Use the same handler as handleImport since they serve the same purpose
    handleImport(recipeData);
  };
  
  return (
    <RecipeFiltersProvider>
      <MainLayout
        title="Recipes"
        action={
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsImportDialogOpen(true)}>
              <Link className="h-5 w-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsPhotoCaptureOpen(true)}>
              <Camera className="h-5 w-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="/recipes/new">
                <Plus className="h-5 w-5 text-primary" />
              </a>
            </Button>
          </div>
        }
      >
        <div className="page-container">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <FiltersBar />
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : recipes && recipes.length > 0 ? (
              <RecipeGrid recipes={recipes.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image || "",
                time: recipe.time,
                rating: recipe.rating || undefined
              }))} />
            ) : (
              <div className="text-center py-10 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                <span className="text-4xl mb-3 block animate-neo-pulse">🍳</span>
                <span className="font-bold uppercase">No recipes found</span>
              </div>
            )}
          </ScrollArea>
        </div>
        
        <ImportRecipeDialog
          open={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImport={handleImport}
        />
        
        <RecipePhotoCapture
          open={isPhotoCaptureOpen}
          onClose={() => setIsPhotoCaptureOpen(false)}
          onRecipeExtracted={handleRecipeExtracted}
        />
        
        <FilterDrawer />
      </MainLayout>
    </RecipeFiltersProvider>
  );
};

export default RecipesList;

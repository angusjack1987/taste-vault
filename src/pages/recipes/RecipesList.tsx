
import { useState, useEffect } from "react";
import { Link, Plus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import useRecipes, { RecipeFormData } from "@/hooks/useRecipes";
import RecipeCard from "@/components/recipes/RecipeCard";
import ImportRecipeDialog from "@/components/recipes/ImportRecipeDialog";
import RecipePhotoCapture from "@/components/recipes/RecipePhotoCapture";
import { useNavigate } from "react-router-dom";

const RecipesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPhotoCaptureOpen, setIsPhotoCaptureOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { useRecipesWithFilters } = useRecipes();
  const { data: recipes = [], isLoading, error } = useRecipesWithFilters({
    title: searchQuery
  });
  
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
    // Handle the imported recipe data here, e.g., save it to your data store
  };

  const handleRecipeExtracted = (recipeData: Partial<RecipeFormData>) => {
    // Navigate to the recipe form with the extracted data
    navigate("/recipes/new", { state: { recipeData } });
  };
  
  return (
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
        
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading recipes...</p>
            ) : recipes && recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  id={recipe.id}
                  title={recipe.title}
                  image={recipe.image || ""}
                  time={recipe.time}
                  // Add any other required props for RecipeCard here
                />
              ))
            ) : (
              <p>No recipes found.</p>
            )}
          </div>
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
    </MainLayout>
  );
};

export default RecipesList;

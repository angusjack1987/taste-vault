
import { useState } from "react";
import { Plus, Search, Loader2, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/MainLayout";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import FiltersBar from "@/components/recipes/FiltersBar";
import ImportRecipeDialog from "@/components/recipes/ImportRecipeDialog";
import useRecipes, { RecipeFormData } from "@/hooks/useRecipes";

const RecipesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { useAllRecipes, useCreateRecipe } = useRecipes();
  const { data: recipes, isLoading, error } = useAllRecipes();
  const { mutate: createRecipe } = useCreateRecipe();
  const navigate = useNavigate();
  
  const handleShowFilters = () => {
    // This would show a filters dialog in a real implementation
    console.log("Show filters dialog");
  };
  
  const handleImportRecipe = (recipeData: Partial<RecipeFormData>) => {
    createRecipe(recipeData as RecipeFormData, {
      onSuccess: (data) => {
        navigate(`/recipes/${data.id}`);
      }
    });
  };
  
  // Filter recipes based on search query
  const filteredRecipes = recipes?.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipe.tags && recipe.tags.some(tag => 
      typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );
  
  // Format recipes for the RecipeGrid component
  const gridRecipes = filteredRecipes?.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || "",
    time: recipe.time || undefined,
    rating: undefined, // We don't have ratings yet
  })) || [];
  
  return (
    <MainLayout 
      title="Recipes" 
      action={
        <div className="flex items-center space-x-1">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setImportDialogOpen(true)}
            title="Import Recipe"
            className="rounded-full"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Link to="/recipes/new">
            <Button 
              size="icon" 
              variant="ghost" 
              title="Create Recipe"
              className="rounded-full bg-secondary text-primary h-9 w-9 flex items-center justify-center"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="page-container">
        <div className="relative mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search recipes..."
              className="pl-9 rounded-full border-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <FiltersBar onFilterClick={handleShowFilters} />
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading recipes. Please try again.
            </div>
          ) : (
            <RecipeGrid 
              recipes={gridRecipes} 
              emptyMessage={
                searchQuery ? 
                  "No recipes match your search" : 
                  "You haven't created any recipes yet. Click the + button to add your first recipe!"
              } 
            />
          )}
        </div>
        
        <ImportRecipeDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImport={handleImportRecipe}
        />
      </div>
    </MainLayout>
  );
};

export default RecipesList;

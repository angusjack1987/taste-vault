
import { useState } from "react";
import { Plus, Search, Loader2, Download, Trash2, Edit2, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import MainLayout from "@/components/layout/MainLayout";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import FiltersBar from "@/components/recipes/FiltersBar";
import ImportRecipeDialog from "@/components/recipes/ImportRecipeDialog";
import useRecipes, { RecipeFormData } from "@/hooks/useRecipes";
import BulkEditDialog from "@/components/recipes/BulkEditDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RecipesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  
  const { useAllRecipes, useCreateRecipe, useBulkDeleteRecipes } = useRecipes();
  const { data: recipes, isLoading, error } = useAllRecipes();
  const { mutate: createRecipe } = useCreateRecipe();
  const { mutate: bulkDeleteRecipes, isPending: isDeleting } = useBulkDeleteRecipes();
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
  
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedRecipes([]);
  };
  
  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipes(prev => 
      prev.includes(id) ? prev.filter(recipeId => recipeId !== id) : [...prev, id]
    );
  };
  
  const selectAllRecipes = () => {
    if (filteredRecipes) {
      setSelectedRecipes(filteredRecipes.map(recipe => recipe.id));
    }
  };
  
  const clearSelection = () => {
    setSelectedRecipes([]);
  };
  
  const handleDeleteSelected = () => {
    bulkDeleteRecipes(selectedRecipes, {
      onSuccess: () => {
        setBulkDeleteDialogOpen(false);
        setSelectionMode(false);
        setSelectedRecipes([]);
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
    selected: selectedRecipes.includes(recipe.id),
    onSelect: selectionMode ? () => toggleRecipeSelection(recipe.id) : undefined,
  })) || [];
  
  return (
    <MainLayout 
      title="Recipes" 
      action={
        <div className="flex items-center space-x-1">
          {selectionMode ? (
            <>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearSelection}
                className="rounded-full"
                disabled={selectedRecipes.length === 0}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={selectAllRecipes}
                className="rounded-full"
              >
                <Check className="h-4 w-4 mr-1" />
                All
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setBulkEditDialogOpen(true)}
                className="rounded-full"
                disabled={selectedRecipes.length === 0}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="rounded-full"
                disabled={selectedRecipes.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                Delete
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={toggleSelectionMode}
                className="rounded-full"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={toggleSelectionMode}
                className="rounded-full"
                title="Select Multiple Recipes"
              >
                <Check className="h-4 w-4" />
              </Button>
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
            </>
          )}
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
            <>
              {selectionMode && (
                <div className="mb-4 p-3 bg-secondary/10 rounded-lg flex items-center justify-between">
                  <span className="text-sm">
                    {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              )}
              <RecipeGrid 
                recipes={gridRecipes} 
                selectionMode={selectionMode}
                emptyMessage={
                  searchQuery ? 
                    "No recipes match your search" : 
                    "You haven't created any recipes yet. Click the + button to add your first recipe!"
                } 
              />
            </>
          )}
        </div>
        
        <ImportRecipeDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImport={handleImportRecipe}
        />
        
        <BulkEditDialog
          open={bulkEditDialogOpen}
          onOpenChange={setBulkEditDialogOpen}
          selectedRecipeIds={selectedRecipes}
          onSuccess={() => {
            setSelectionMode(false);
            setSelectedRecipes([]);
          }}
        />
        
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Recipes</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default RecipesList;


import { useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/MainLayout";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import FiltersBar from "@/components/recipes/FiltersBar";
import useRecipes from "@/hooks/useRecipes";

const RecipesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { useAllRecipes } = useRecipes();
  const { data: recipes, isLoading, error } = useAllRecipes();
  
  const handleShowFilters = () => {
    // This would show a filters dialog in a real implementation
    console.log("Show filters dialog");
  };
  
  // Filter recipes based on search query
  const filteredRecipes = recipes?.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Format recipes for the RecipeGrid component
  const gridRecipes = filteredRecipes?.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    time: recipe.time || undefined,
    rating: undefined, // We don't have ratings yet
  })) || [];
  
  return (
    <MainLayout 
      title="Recipes" 
      action={
        <Link to="/recipes/new">
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      }
    >
      <div className="page-container">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search recipes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
      </div>
    </MainLayout>
  );
};

export default RecipesList;

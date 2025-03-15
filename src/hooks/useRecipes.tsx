
import { useAuth } from "./useAuth";
import * as recipes from "./recipes";
import { Recipe, RecipeFormData } from "./recipes/types";

export const useRecipes = () => {
  const { user } = useAuth();
  
  // Queries
  const useAllRecipes = () => recipes.useAllRecipes(user);
  const useRecipesWithFilters = (filters = {}, options = {}) => recipes.useRecipesWithFilters(filters, options);
  const useRecipe = (id?: string) => recipes.useRecipe(id, user);
  
  // Mutations
  const useCreateRecipe = () => recipes.useCreateRecipe(user);
  const useUpdateRecipe = () => recipes.useUpdateRecipe(user);
  const useBulkUpdateRecipes = () => recipes.useBulkUpdateRecipes(user);
  const useDeleteRecipe = () => recipes.useDeleteRecipe(user);
  const useBulkDeleteRecipes = () => recipes.useBulkDeleteRecipes(user);
  
  return {
    useRecipes: recipes.useAllRecipes,  // For backward compatibility
    useRecipesWithFilters,
    useRecipe,
    useCreateRecipe,
    useUpdateRecipe,
    useBulkUpdateRecipes,
    useDeleteRecipe,
    useBulkDeleteRecipes,
    // Add the useAllRecipes function to fix the error in other components
    useAllRecipes,
    // Add alias for useCreateRecipe to match the code in RecipesList
    useAddRecipe: useCreateRecipe
  };
};

export type { Recipe, RecipeFormData };
export default useRecipes;

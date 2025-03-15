
import { useAuth } from "./useAuth";
import * as recipes from "./recipes";
import { Recipe, RecipeFormData } from "./recipes/types";

export const useRecipes = () => {
  const { user } = useAuth();
  
  // Queries
  const useRecipes = (options = {}) => recipes.useRecipes(options);
  const useRecipesWithFilters = (filters = {}, options = {}) => recipes.useRecipesWithFilters(filters, options);
  const useRecipe = (id?: string) => recipes.useRecipe(id);
  
  // Mutations
  const useCreateRecipe = () => recipes.useCreateRecipe(user);
  const useUpdateRecipe = () => recipes.useUpdateRecipe(user);
  const useBulkUpdateRecipes = () => recipes.useBulkUpdateRecipes(user);
  const useDeleteRecipe = () => recipes.useDeleteRecipe(user);
  const useBulkDeleteRecipes = () => recipes.useBulkDeleteRecipes(user);
  
  return {
    useRecipes,
    useRecipesWithFilters,
    useRecipe,
    useCreateRecipe,
    useUpdateRecipe,
    useBulkUpdateRecipes,
    useDeleteRecipe,
    useBulkDeleteRecipes
  };
};

export type { Recipe, RecipeFormData };
export default useRecipes;

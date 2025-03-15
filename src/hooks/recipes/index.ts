
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../useAuth";
import { useAllRecipes, useRecipe, useRecipesWithFilters } from "./queries";
import {
  useCreateRecipe,
  useUpdateRecipe,
  useBulkUpdateRecipes,
  useDeleteRecipe,
  useBulkDeleteRecipes
} from "./mutations";

export type { Recipe, RecipeFormData } from "./types";

// Export these hooks directly for direct import by other modules
export {
  useAllRecipes,
  useRecipe,
  useRecipesWithFilters,
  useCreateRecipe,
  useUpdateRecipe,
  useBulkUpdateRecipes,
  useDeleteRecipe,
  useBulkDeleteRecipes
};

// This is the main hook that all components should use
const useRecipes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return {
    useAllRecipes: () => useAllRecipes(user),
    useRecipe: (id: string | undefined) => useRecipe(id, user),
    useCreateRecipe: () => useCreateRecipe(user),
    useUpdateRecipe: () => useUpdateRecipe(user),
    useBulkUpdateRecipes: () => useBulkUpdateRecipes(user),
    useDeleteRecipe: () => useDeleteRecipe(user),
    useBulkDeleteRecipes: () => useBulkDeleteRecipes(user),
  };
};

export default useRecipes;

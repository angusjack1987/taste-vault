
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../useAuth";
import { useAllRecipes, useRecipe } from "./queries";
import {
  useCreateRecipe,
  useUpdateRecipe,
  useBulkUpdateRecipes,
  useDeleteRecipe,
  useBulkDeleteRecipes
} from "./mutations";

export type { Recipe, RecipeFormData } from "./types";

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

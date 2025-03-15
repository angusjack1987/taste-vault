import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Recipe, RecipeFormData } from "./types";
import { User } from "@supabase/supabase-js";

export const createRecipe = async (recipeData: RecipeFormData, user: User | null): Promise<Recipe> => {
  if (!user) throw new Error("User not authenticated");

  // Ensure rating is explicitly set to null if not provided
  const newRecipe = {
    ...recipeData,
    user_id: user.id,
    images: recipeData.images || [],
    rating: recipeData.rating ?? null, // Use nullish coalescing to ensure null if undefined
  };

  const { data, error } = await supabase
    .from("recipes")
    .insert([newRecipe])
    .select()
    .single();

  if (error) {
    console.error("Error creating recipe:", error);
    toast.error("Failed to create recipe");
    throw error;
  }

  toast.success("Recipe created successfully");

  return {
    ...data,
    ingredients: Array.isArray(data.ingredients) 
      ? data.ingredients.map(i => String(i)) 
      : [],
    instructions: Array.isArray(data.instructions) 
      ? data.instructions.map(i => String(i)) 
      : [],
    tags: Array.isArray(data.tags) 
      ? data.tags.map(t => String(t)) 
      : [],
    images: Array.isArray(data.images) 
      ? data.images.map(img => String(img)) 
      : [],
    rating: data.rating,
  };
};

export const updateRecipe = async ({
  id,
  ...recipeData
}: RecipeFormData & { id: string }, user: User | null): Promise<Recipe> => {
  if (!user) throw new Error("User not authenticated");

  const updateData = {
    ...recipeData,
    images: recipeData.images || [],
    rating: recipeData.rating ?? null, // Ensure rating is explicitly set to null if not provided
  };

  const { data, error } = await supabase
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating recipe:", error);
    toast.error("Failed to update recipe");
    throw error;
  }

  toast.success("Recipe updated successfully");

  return {
    ...data,
    ingredients: Array.isArray(data.ingredients) 
      ? data.ingredients.map(i => String(i)) 
      : [],
    instructions: Array.isArray(data.instructions) 
      ? data.instructions.map(i => String(i)) 
      : [],
    tags: Array.isArray(data.tags) 
      ? data.tags.map(t => String(t)) 
      : [],
    images: Array.isArray(data.images) 
      ? data.images.map(img => String(img)) 
      : [],
    rating: data.rating,
  };
};

export const bulkUpdateRecipes = async (
  recipeUpdates: Array<{ id: string, updates: Partial<RecipeFormData> }>,
  user: User | null
): Promise<void> => {
  if (!user) throw new Error("User not authenticated");
  
  for (const { id, updates } of recipeUpdates) {
    const { error } = await supabase
      .from("recipes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);
    
    if (error) {
      console.error(`Error updating recipe ${id}:`, error);
      toast.error(`Failed to update recipe: ${error.message}`);
      throw error;
    }
  }
  
  toast.success(`${recipeUpdates.length} recipes updated successfully`);
};

export const deleteRecipe = async (id: string, user: User | null): Promise<void> => {
  if (!user) throw new Error("User not authenticated");

  try {
    const { error: mealPlanError } = await supabase
      .from("meal_plans")
      .update({ recipe_id: null })
      .eq("recipe_id", id)
      .eq("user_id", user.id);

    if (mealPlanError) {
      console.error("Error removing meal plan references:", mealPlanError);
      toast.error("Failed to remove meal plan references");
      throw mealPlanError;
    }

    const { error: shoppingListError } = await supabase
      .from("shopping_list")
      .delete()
      .eq("recipe_id", id)
      .eq("user_id", user.id);

    if (shoppingListError) {
      console.error("Error removing shopping list items:", shoppingListError);
      toast.error("Failed to remove shopping list items");
      throw shoppingListError;
    }

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
      throw error;
    }

    toast.success("Recipe deleted successfully");
  } catch (error) {
    console.error("Error in recipe deletion process:", error);
    throw error;
  }
};

export const bulkDeleteRecipes = async (ids: string[], user: User | null): Promise<void> => {
  if (!user) throw new Error("User not authenticated");
  
  try {
    const { error: mealPlanError } = await supabase
      .from("meal_plans")
      .update({ recipe_id: null })
      .in("recipe_id", ids)
      .eq("user_id", user.id);

    if (mealPlanError) {
      console.error("Error removing meal plan references:", mealPlanError);
      toast.error("Failed to remove meal plan references");
      throw mealPlanError;
    }

    const { error: shoppingListError } = await supabase
      .from("shopping_list")
      .delete()
      .in("recipe_id", ids)
      .eq("user_id", user.id);

    if (shoppingListError) {
      console.error("Error removing shopping list items:", shoppingListError);
      toast.error("Failed to remove shopping list items");
      throw shoppingListError;
    }

    const { error } = await supabase
      .from("recipes")
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting recipes:", error);
      toast.error("Failed to delete recipes");
      throw error;
    }

    toast.success(`${ids.length} recipes deleted successfully`);
  } catch (error) {
    console.error("Error in bulk recipe deletion process:", error);
    throw error;
  }
};

export const useCreateRecipe = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipeData: RecipeFormData) => createRecipe(recipeData, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useUpdateRecipe = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RecipeFormData & { id: string }) => updateRecipe(data, user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", data.id] });
    },
  });
};

export const useBulkUpdateRecipes = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipeUpdates: Array<{ id: string, updates: Partial<RecipeFormData> }>) => 
      bulkUpdateRecipes(recipeUpdates, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useDeleteRecipe = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useBulkDeleteRecipes = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteRecipes(ids, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

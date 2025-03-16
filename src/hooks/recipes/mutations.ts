
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

  // After creating, trigger sync with connected users via the realtime subscription
  console.log("Recipe created successfully, will be synced with connected users");

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

// Create hooks for mutations
export const useCreateRecipe = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipeData: RecipeFormData) => createRecipe(recipeData, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useUpdateRecipe = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecipeFormData> }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("recipes")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) {
        toast.error("Failed to update recipe");
        throw error;
      }
      
      toast.success("Recipe updated successfully");
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useBulkUpdateRecipes = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<RecipeFormData> }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("recipes")
        .update(data)
        .in("id", ids)
        .eq("user_id", user.id);
        
      if (error) {
        toast.error("Failed to update recipes");
        throw error;
      }
      
      toast.success("Recipes updated successfully");
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useDeleteRecipe = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) {
        toast.error("Failed to delete recipe");
        throw error;
      }
      
      toast.success("Recipe deleted successfully");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useBulkDeleteRecipes = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("recipes")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);
        
      if (error) {
        toast.error("Failed to delete recipes");
        throw error;
      }
      
      toast.success("Recipes deleted successfully");
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

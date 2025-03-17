
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

  // After creating, the recipe will be synced with connected users via the realtime subscription
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
    mutationFn: async (params: { id: string; data: Partial<RecipeFormData> } | Partial<RecipeFormData> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Support both formats: { id, data } and { id, ...otherProps }
      const id = 'id' in params ? params.id : '';
      const data = 'data' in params 
        ? params.data 
        : Object.fromEntries(
            Object.entries(params).filter(([key]) => key !== 'id')
          );
      
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
      // The update will trigger a sync via the realtime subscription
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
    mutationFn: async (params: { ids: string[]; data: Partial<RecipeFormData> } | { id: string; updates: Record<string, any> }[]) => {
      if (!user) throw new Error("User not authenticated");
      
      // Handle both formats
      if (Array.isArray(params)) {
        // Handle array of {id, updates}
        const ids = params.map(item => item.id);
        // When dealing with multiple items with different updates,
        // we need to run multiple update operations
        for (const item of params) {
          const { error } = await supabase
            .from("recipes")
            .update(item.updates)
            .eq("id", item.id)
            .eq("user_id", user.id);
            
          if (error) {
            toast.error(`Failed to update recipe ${item.id}`);
            throw error;
          }
        }
        
        toast.success("Recipes updated successfully");
        return ids;
      } else {
        // Handle {ids, data} format
        const { ids, data } = params;
        
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
      }
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

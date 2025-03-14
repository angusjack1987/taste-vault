import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "./useAuth";
import { Json } from "@/integrations/supabase/types";

export type Recipe = {
  id: string;
  title: string;
  image: string | null;
  time: number | null;
  servings: number | null;
  difficulty: string | null;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type RecipeFormData = Omit<Recipe, "id" | "created_at" | "updated_at">;

export const useRecipes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchRecipes = async (): Promise<Recipe[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load recipes");
      throw error;
    }

    return (data || []).map((item) => ({
      ...item,
      ingredients: Array.isArray(item.ingredients) 
        ? item.ingredients.map(i => String(i))
        : [],
      instructions: Array.isArray(item.instructions) 
        ? item.instructions.map(i => String(i))
        : [],
      tags: Array.isArray(item.tags) 
        ? item.tags.map(t => String(t))
        : [],
    }));
  };

  const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching recipe:", error);
      toast.error("Failed to load recipe details");
      throw error;
    }

    if (!data) return null;

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
    };
  };

  const createRecipe = async (recipeData: RecipeFormData): Promise<Recipe> => {
    if (!user) throw new Error("User not authenticated");

    const newRecipe = {
      ...recipeData,
      user_id: user.id,
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
    };
  };

  const updateRecipe = async ({
    id,
    ...recipeData
  }: RecipeFormData & { id: string }): Promise<Recipe> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("recipes")
      .update(recipeData)
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
    };
  };

  const bulkUpdateRecipes = async (
    recipeUpdates: Array<{ id: string, updates: Partial<RecipeFormData> }>
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
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
  };

  const deleteRecipe = async (id: string): Promise<void> => {
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

  const bulkDeleteRecipes = async (ids: string[]): Promise<void> => {
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

  const useAllRecipes = () => {
    return useQuery({
      queryKey: ["recipes"],
      queryFn: fetchRecipes,
      enabled: !!user,
    });
  };

  const useRecipe = (id: string | undefined) => {
    return useQuery({
      queryKey: ["recipe", id],
      queryFn: () => (id ? fetchRecipeById(id) : Promise.resolve(null)),
      enabled: !!user && !!id,
    });
  };

  const useCreateRecipe = () => {
    return useMutation({
      mutationFn: createRecipe,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
    });
  };

  const useUpdateRecipe = () => {
    return useMutation({
      mutationFn: updateRecipe,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
        queryClient.invalidateQueries({ queryKey: ["recipe", data.id] });
      },
    });
  };

  const useBulkUpdateRecipes = () => {
    return useMutation({
      mutationFn: bulkUpdateRecipes,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
    });
  };

  const useDeleteRecipe = () => {
    return useMutation({
      mutationFn: deleteRecipe,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
    });
  };

  const useBulkDeleteRecipes = () => {
    return useMutation({
      mutationFn: bulkDeleteRecipes,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
      },
    });
  };

  return {
    useAllRecipes,
    useRecipe,
    useCreateRecipe,
    useUpdateRecipe,
    useBulkUpdateRecipes,
    useDeleteRecipe,
    useBulkDeleteRecipes,
  };
};

export default useRecipes;

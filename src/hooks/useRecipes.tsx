
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

  const deleteRecipe = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
      throw error;
    }

    toast.success("Recipe deleted successfully");
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

  const useDeleteRecipe = () => {
    return useMutation({
      mutationFn: deleteRecipe,
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
    useDeleteRecipe,
  };
};

export default useRecipes;

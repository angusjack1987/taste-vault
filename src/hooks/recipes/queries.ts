
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Recipe } from "./types";
import { User } from "@supabase/supabase-js";

export const fetchRecipes = async (user: User | null): Promise<Recipe[]> => {
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
    images: Array.isArray(item.images) 
      ? item.images 
      : [],
  }));
};

export const fetchRecipeById = async (id: string, user: User | null): Promise<Recipe | null> => {
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
    images: Array.isArray(data.images) 
      ? data.images 
      : [],
  };
};

export const useAllRecipes = (user: User | null) => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: () => fetchRecipes(user),
    enabled: !!user,
  });
};

export const useRecipe = (id: string | undefined, user: User | null) => {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => (id ? fetchRecipeById(id, user) : Promise.resolve(null)),
    enabled: !!user && !!id,
  });
};

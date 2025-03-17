import { useQuery } from "@tanstack/react-query";
import { supabase, handleSupabaseRequest } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Recipe } from "./types";
import { User } from "@supabase/supabase-js";
import { useAuth } from "../useAuth";

export const fetchRecipes = async (user: User | null): Promise<Recipe[]> => {
  if (!user) return [];

  return handleSupabaseRequest(
    async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      return { data, error };
    },
    "Failed to load recipes"
  ) as Promise<Recipe[]>;
};

export const fetchRandomRecipeByMealType = async (mealType: string, user: User | null): Promise<Recipe | null> => {
  if (!user) return null;
  
  return handleSupabaseRequest(
    async () => {
      let query = supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id);
      
      if (mealType === 'breakfast') {
        query = query.or('title.ilike.%breakfast%,tags.cs.{breakfast}');
      } else if (mealType === 'lunch') {
        query = query.or('title.ilike.%lunch%,tags.cs.{lunch}');
      } else if (mealType === 'dinner') {
        query = query.or('title.ilike.%dinner%,tags.cs.{dinner}');
      }
      
      // Add a limit and random order
      query = query.limit(1).order('created_at', { ascending: false });
      
      const response = await query;
      return response;
    },
    "Failed to fetch random recipe"
  ).then(data => {
    if (!data || data.length === 0) return null;
    
    return {
      ...data[0],
      ingredients: Array.isArray(data[0].ingredients) 
        ? data[0].ingredients.map(i => String(i))
        : [],
      instructions: Array.isArray(data[0].instructions) 
        ? data[0].instructions.map(i => String(i))
        : [],
      tags: Array.isArray(data[0].tags) 
        ? data[0].tags.map(t => String(t))
        : [],
      images: Array.isArray(data[0].images) 
        ? data[0].images.map(img => String(img)) 
        : [],
      rating: data[0].rating ?? null,
    };
  });
};

export const fetchRecipesWithFilters = async (filters: any = {}, user: User | null): Promise<Recipe[]> => {
  if (!user) return [];

  let query = supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id);

  if (filters.title) {
    query = query.ilike('title', `%${filters.title}%`);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching recipes with filters:", error);
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
      ? item.images.map(img => String(img)) 
      : [],
    rating: item.rating ?? null, // Ensure rating is explicitly set to null if not provided
  }));
};

export const fetchRecipeById = async (id: string, user: User | null): Promise<Recipe | null> => {
  if (!user) return null;

  return handleSupabaseRequest(
    async () => {
      const response = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
        
      return response;
    },
    "Failed to load recipe details"
  ).then(data => {
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
        ? data.images.map(img => String(img)) 
        : [],
      rating: data.rating ?? null,
    };
  });
};

export const useAllRecipes = (user: User | null) => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: () => fetchRecipes(user),
    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // 30 seconds
  });
};

export const useRandomRecipeByMealType = (mealType: string, user: User | null) => {
  return useQuery({
    queryKey: ["recipe", "random", mealType],
    queryFn: () => fetchRandomRecipeByMealType(mealType, user),
    enabled: !!user && !!mealType,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useRecipesWithFilters = (filters: any = {}, options: any = {}) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recipes", "filtered", filters],
    queryFn: () => fetchRecipesWithFilters(filters, user),
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
    ...options
  });
};

export const useRecipe = (id: string | undefined, user: User | null) => {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => (id ? fetchRecipeById(id, user) : Promise.resolve(null)),
    enabled: !!user && !!id,
    retry: 2,
    retryDelay: 1000,
  });
};

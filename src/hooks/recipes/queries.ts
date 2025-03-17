
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Recipe } from "./types";
import { User } from "@supabase/supabase-js";
import { useAuth } from "../useAuth";

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

  // Deduplicate recipes by title
  const uniqueTitles = new Set<string>();
  const uniqueRecipes = (data || []).filter(recipe => {
    const normalizedTitle = recipe.title.toLowerCase().trim();
    if (uniqueTitles.has(normalizedTitle)) {
      return false;
    }
    uniqueTitles.add(normalizedTitle);
    return true;
  });

  return uniqueRecipes.map((item) => ({
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
    isShared: false, // Own recipes are not shared
  }));
};

export const fetchRandomRecipeByMealType = async (mealType: string, user: User | null): Promise<Recipe | null> => {
  if (!user) return null;
  
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
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching random recipe:", error);
    return null;
  }
  
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
};

export const fetchRecipesWithFilters = async (filters: any = {}, user: User | null): Promise<Recipe[]> => {
  if (!user) return [];

  // First get user's own recipes
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

  const { data: ownRecipes, error: ownError } = await query;

  if (ownError) {
    console.error("Error fetching own recipes with filters:", ownError);
    toast.error("Failed to load recipes");
    throw ownError;
  }

  // Get shared recipes from profiles the user has connected with
  const { data: connections, error: connectionError } = await supabase
    .from("profile_sharing")
    .select("user_id_1, user_id_2")
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

  if (connectionError) {
    console.error("Error fetching connections:", connectionError);
    // Just continue with own recipes if we can't fetch connections
  }

  // Extract connected user IDs
  const connectedUserIds = (connections || []).map(conn => 
    conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1
  );

  let sharedRecipes: any[] = [];
  
  if (connectedUserIds.length > 0) {
    // Fetch recipes from connected users
    let sharedQuery = supabase
      .from("recipes")
      .select("*")
      .in("user_id", connectedUserIds);
      
    if (filters.title) {
      sharedQuery = sharedQuery.ilike('title', `%${filters.title}%`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      sharedQuery = sharedQuery.contains('tags', filters.tags);
    }

    sharedQuery = sharedQuery.order("created_at", { ascending: false });
    
    const { data: sharedData, error: sharedError } = await sharedQuery;
    
    if (sharedError) {
      console.error("Error fetching shared recipes:", sharedError);
      // Continue with own recipes if shared recipes fetch fails
    } else {
      sharedRecipes = sharedData || [];
    }
  }

  // Combine own and shared recipes
  const allRecipes = [
    ...(ownRecipes || []).map(r => ({ ...r, isShared: false })),
    ...sharedRecipes.map(r => ({ ...r, isShared: true }))
  ];

  // Deduplicate recipes by title
  const uniqueTitles = new Set<string>();
  const uniqueRecipes = allRecipes.filter(recipe => {
    const normalizedTitle = recipe.title.toLowerCase().trim();
    if (uniqueTitles.has(normalizedTitle)) {
      return false;
    }
    uniqueTitles.add(normalizedTitle);
    return true;
  });

  return uniqueRecipes.map((item) => ({
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

  // First try to fetch as own recipe
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  // If recipe is found and belongs to user
  if (data && data.user_id === user.id) {
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
      isShared: false
    };
  }
  
  // If not found or not user's recipe, check if it's a shared recipe
  if (!data || data.user_id !== user.id) {
    // Get shared recipes from profiles the user has connected with
    const { data: connections, error: connectionError } = await supabase
      .from("profile_sharing")
      .select("user_id_1, user_id_2")
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

    if (connectionError) {
      console.error("Error fetching connections:", connectionError);
      toast.error("Failed to load recipe details");
      return null;
    }

    // Extract connected user IDs
    const connectedUserIds = (connections || []).map(conn => 
      conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1
    );
    
    if (connectedUserIds.length > 0) {
      // Fetch the recipe if it belongs to a connected user
      const { data: sharedRecipe, error: sharedError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .in("user_id", connectedUserIds)
        .single();
        
      if (sharedError || !sharedRecipe) {
        console.error("Error fetching shared recipe:", sharedError);
        toast.error("Failed to load recipe details");
        return null;
      }
      
      return {
        ...sharedRecipe,
        ingredients: Array.isArray(sharedRecipe.ingredients) 
          ? sharedRecipe.ingredients.map(i => String(i)) 
          : [],
        instructions: Array.isArray(sharedRecipe.instructions) 
          ? sharedRecipe.instructions.map(i => String(i)) 
          : [],
        tags: Array.isArray(sharedRecipe.tags) 
          ? sharedRecipe.tags.map(t => String(t)) 
          : [],
        images: Array.isArray(sharedRecipe.images) 
          ? sharedRecipe.images.map(img => String(img)) 
          : [],
        rating: sharedRecipe.rating ?? null,
        isShared: true
      };
    }
  }

  if (error) {
    console.error("Error fetching recipe:", error);
    toast.error("Failed to load recipe details");
    return null;
  }

  return null;
};

export const useAllRecipes = (user: User | null) => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: () => fetchRecipes(user),
    enabled: !!user,
  });
};

export const useRandomRecipeByMealType = (mealType: string, user: User | null) => {
  return useQuery({
    queryKey: ["recipe", "random", mealType],
    queryFn: () => fetchRandomRecipeByMealType(mealType, user),
    enabled: !!user && !!mealType,
  });
};

export const useRecipesWithFilters = (filters: any = {}, options: any = {}) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recipes", "filtered", filters],
    queryFn: () => fetchRecipesWithFilters(filters, user),
    enabled: !!user,
    ...options
  });
};

export const useRecipe = (id: string | undefined, user: User | null) => {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => (id ? fetchRecipeById(id, user) : Promise.resolve(null)),
    enabled: !!user && !!id,
  });
};

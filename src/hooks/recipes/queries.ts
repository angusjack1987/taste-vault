import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Recipe } from "./types";
import { User } from "@supabase/supabase-js";
import { useAuth } from "../useAuth";

// Helper function to normalize difficulty
const normalizeDifficulty = (difficulty: string | undefined | null): "easy" | "medium" | "hard" | undefined => {
  if (!difficulty) return undefined;
  
  const normalized = difficulty.toLowerCase();
  
  if (normalized === "easy" || normalized === "medium" || normalized === "hard") {
    return normalized as "easy" | "medium" | "hard";
  }
  
  // Default to "medium" if not a valid value
  return "medium";
};

// Helper function to format a recipe from the database
const formatRecipe = (item: any, isShared: boolean = false): Recipe => {
  return {
    ...item,
    ingredients: Array.isArray(item.ingredients) 
      ? item.ingredients.map((i: any) => String(i))
      : [],
    instructions: Array.isArray(item.instructions) 
      ? item.instructions.map((i: any) => String(i))
      : [],
    tags: Array.isArray(item.tags) 
      ? item.tags.map((t: any) => String(t))
      : [],
    images: Array.isArray(item.images) 
      ? item.images.map((img: any) => String(img)) 
      : [],
    image: item.image || "", // Ensure image is always a string
    rating: item.rating ?? null, // Ensure rating is explicitly set to null if not provided
    difficulty: normalizeDifficulty(item.difficulty),
    isShared
  };
};

export const fetchRecipes = async (user: User | null): Promise<Recipe[]> => {
  if (!user) return [];

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
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

  return uniqueRecipes.map(item => formatRecipe(item, false));
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
  
  return formatRecipe(data[0]);
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
    ...(ownRecipes || []).map(r => formatRecipe(r, false)),
    ...sharedRecipes.map(r => formatRecipe(r, true))
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

  return uniqueRecipes;
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
    return formatRecipe(data, false);
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
        return null;
      }
      
      return formatRecipe(sharedRecipe, true);
    }
  }

  if (error) {
    console.error("Error fetching recipe:", error);
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

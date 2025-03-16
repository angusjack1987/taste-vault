
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

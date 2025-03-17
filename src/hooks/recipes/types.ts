
export interface RecipeFormData {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  time?: number; // in minutes
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  notes?: string;
  rating?: number;
  image?: string;
  images?: string[];
  nutrients?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    [key: string]: number | undefined;
  };
}

export interface Recipe extends RecipeFormData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  isShared?: boolean;
  // Make image optional in Recipe interface to match reality
  image?: string;
}

// Define a SharingPreferences type for use in useSync hook
export interface SharingPreferences {
  recipes: boolean;
  babyRecipes: boolean;
  fridgeItems: boolean;
  shoppingList: boolean;
  mealPlan: boolean;
}

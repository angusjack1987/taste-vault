
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

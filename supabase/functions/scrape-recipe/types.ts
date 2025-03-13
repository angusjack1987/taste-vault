
export interface Recipe {
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
}

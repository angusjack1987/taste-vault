import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "./useAuth";
import { format, parseISO } from "date-fns";

export type MealType = "breakfast" | "lunch" | "dinner";

export type MealPlan = {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  recipe_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MealPlanWithRecipe = MealPlan & {
  recipe: {
    id: string;
    title: string;
    image: string | null;
  } | null;
};

export const useMealPlans = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchMealPlansForRange = async (
    startDate: Date,
    endDate: Date
  ): Promise<MealPlanWithRecipe[]> => {
    if (!user) return [];

    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("meal_plans")
      .select(
        `
        *,
        recipe:recipes (
          id,
          title,
          image
        )
      `
      )
      .eq("user_id", user.id)
      .gte("date", startStr)
      .lte("date", endStr)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching meal plans:", error);
      toast.error("Failed to load meal plans");
      throw error;
    }

    // Transform the data to match our MealPlanWithRecipe type
    return (data || []).map(item => ({
      ...item,
      meal_type: item.meal_type as MealType,
      recipe: item.recipe || null
    }));
  };

  const fetchTodaysMeals = async (): Promise<MealPlanWithRecipe[]> => {
    if (!user) return [];

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("meal_plans")
      .select(
        `
        *,
        recipe:recipes (
          id,
          title,
          image
        )
      `
      )
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .order("meal_type", { ascending: true });

    if (error) {
      console.error("Error fetching today's meals:", error);
      toast.error("Failed to load today's meals");
      throw error;
    }

    // Transform the data to match our MealPlanWithRecipe type
    return (data || []).map(item => ({
      ...item,
      meal_type: item.meal_type as MealType,
      recipe: item.recipe || null
    }));
  };

  const createMealPlan = async (mealPlan: {
    date: Date;
    meal_type: MealType;
    recipe_id: string | null;
  }): Promise<MealPlan> => {
    if (!user) throw new Error("User not authenticated");

    const formattedDate = format(mealPlan.date, "yyyy-MM-dd");

    const newMealPlan = {
      user_id: user.id,
      date: formattedDate,
      meal_type: mealPlan.meal_type,
      recipe_id: mealPlan.recipe_id,
    };

    // First try to find an existing meal plan for this day and meal type
    const { data: existingMeal } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", formattedDate)
      .eq("meal_type", mealPlan.meal_type)
      .maybeSingle();

    let result;

    if (existingMeal) {
      // Update the existing meal plan
      const { data, error } = await supabase
        .from("meal_plans")
        .update({ recipe_id: mealPlan.recipe_id })
        .eq("id", existingMeal.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating meal plan:", error);
        toast.error("Failed to update meal plan");
        throw error;
      }

      result = data;
    } else {
      // Create a new meal plan
      const { data, error } = await supabase
        .from("meal_plans")
        .insert([newMealPlan])
        .select()
        .single();

      if (error) {
        console.error("Error creating meal plan:", error);
        toast.error("Failed to create meal plan");
        throw error;
      }

      result = data;
    }

    // Transform the data to match our MealPlan type
    return {
      ...result,
      meal_type: result.meal_type as MealType
    };
  };

  const deleteMealPlan = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure we only delete meal plans owned by the current user

    if (error) {
      console.error("Error deleting meal plan:", error);
      toast.error("Failed to remove meal from plan");
      throw error;
    }
  };

  const useMealPlansForRange = (startDate: Date, endDate: Date) => {
    return useQuery({
      queryKey: ["meal-plans", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
      queryFn: () => fetchMealPlansForRange(startDate, endDate),
      enabled: !!user,
    });
  };

  const useTodaysMeals = () => {
    return useQuery({
      queryKey: ["meal-plans", "today", format(new Date(), "yyyy-MM-dd")],
      queryFn: fetchTodaysMeals,
      enabled: !!user,
    });
  };

  const useCreateMealPlan = () => {
    return useMutation({
      mutationFn: createMealPlan,
      onSuccess: () => {
        // Invalidate all meal plan queries
        queryClient.invalidateQueries({
          queryKey: ["meal-plans"],
        });
      },
    });
  };

  const useDeleteMealPlan = () => {
    return useMutation({
      mutationFn: deleteMealPlan,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["meal-plans"],
        });
      },
    });
  };

  return {
    useMealPlansForRange,
    useCreateMealPlan,
    useDeleteMealPlan,
    useTodaysMeals,
  };
};

export default useMealPlans;

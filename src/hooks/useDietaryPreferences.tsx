import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "./useAuth";

export type DietaryPreference = {
  id: string;
  user_id: string;
  preferences: Record<string, any>;
  restrictions: string[];
  created_at: string;
  updated_at: string;
};

export const useDietaryPreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchDietaryPreferences = async (): Promise<DietaryPreference | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_dietary_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error fetching dietary preferences:", error);
      toast.error("Failed to load dietary preferences");
      throw error;
    }

    if (!data) return null;

    // Transform the data to match our DietaryPreference type
    return {
      ...data,
      preferences: typeof data.preferences === 'object' ? data.preferences : {},
      restrictions: Array.isArray(data.restrictions) 
        ? data.restrictions.map(r => String(r))
        : []
    };
  };

  const updateDietaryPreferences = async (preferences: {
    preferences: Record<string, any>;
    restrictions: string[];
  }): Promise<DietaryPreference> => {
    if (!user) throw new Error("User not authenticated");

    // First check if the user already has preferences
    const { data: existingData } = await supabase
      .from("user_dietary_preferences")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;

    if (existingData) {
      // Update existing preferences
      const { data, error } = await supabase
        .from("user_dietary_preferences")
        .update(preferences)
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating dietary preferences:", error);
        toast.error("Failed to update dietary preferences");
        throw error;
      }

      result = data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from("user_dietary_preferences")
        .insert([{ user_id: user.id, ...preferences }])
        .select()
        .single();

      if (error) {
        console.error("Error creating dietary preferences:", error);
        toast.error("Failed to save dietary preferences");
        throw error;
      }

      result = data;
    }

    toast.success("Dietary preferences saved");
    
    // Transform the returned data to match our DietaryPreference type
    return {
      ...result,
      preferences: typeof result.preferences === 'object' ? result.preferences : {},
      restrictions: Array.isArray(result.restrictions) 
        ? result.restrictions.map(r => String(r))
        : []
    };
  };

  const useDietaryPreferencesQuery = () => {
    return useQuery({
      queryKey: ["dietary-preferences"],
      queryFn: fetchDietaryPreferences,
      enabled: !!user,
    });
  };

  const useUpdateDietaryPreferences = () => {
    return useMutation({
      mutationFn: updateDietaryPreferences,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["dietary-preferences"] });
      },
    });
  };

  return {
    useDietaryPreferencesQuery,
    useUpdateDietaryPreferences,
  };
};

export default useDietaryPreferences;

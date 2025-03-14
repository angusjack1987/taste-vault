
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { AISettings, UserPreferences } from "./useAiRecipes";

export interface PromptHistoryItem {
  id: string;
  user_id: string;
  timestamp: string;
  endpoint: string;
  prompt: string;
  response_preview?: string | null;
  model?: string | null;
  temperature?: number | null;
}

export const useAISettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch AI settings from user preferences
  const fetchAISettings = async (): Promise<AISettings | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching AI settings:", error);
        throw error;
      }
      
      if (data?.preferences && 
          typeof data.preferences === 'object' && 
          !Array.isArray(data.preferences)) {
        const userPrefs = data.preferences as UserPreferences;
        return userPrefs.ai || null;
      }
      
      return null;
    } catch (err) {
      console.error("Error in fetchAISettings:", err);
      toast.error("Failed to load AI settings");
      throw err;
    }
  };
  
  // Update AI settings in user preferences
  const updateAISettings = async (aiSettings: AISettings): Promise<AISettings> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // First get existing preferences
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id, preferences')
        .eq('user_id', user.id)
        .single();
      
      let updatedPreferences: UserPreferences = {
        ...(existingData?.preferences as UserPreferences || {}),
        ai: aiSettings
      };
      
      let result;
      
      if (existingData) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .update({ preferences: updatedPreferences })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .insert([{ 
            user_id: user.id,
            preferences: updatedPreferences
          }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      toast.success("AI settings saved");
      return aiSettings;
      
    } catch (err) {
      console.error("Error updating AI settings:", err);
      toast.error("Failed to save AI settings");
      throw err;
    }
  };
  
  // Fetch prompt history
  const fetchPromptHistory = async (): Promise<PromptHistoryItem[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('ai_prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data as PromptHistoryItem[];
    } catch (err) {
      console.error("Error fetching prompt history:", err);
      toast.error("Failed to load prompt history");
      return [];
    }
  };
  
  // Clear prompt history
  const clearPromptHistory = async (): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const { error } = await supabase
        .from('ai_prompt_history')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success("Prompt history cleared");
    } catch (err) {
      console.error("Error clearing prompt history:", err);
      toast.error("Failed to clear prompt history");
      throw err;
    }
  };
  
  // React Query hooks
  const useAISettingsQuery = () => {
    return useQuery({
      queryKey: ['ai-settings'],
      queryFn: fetchAISettings,
      enabled: !!user,
    });
  };
  
  const useUpdateAISettings = () => {
    return useMutation({
      mutationFn: updateAISettings,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      },
    });
  };
  
  const usePromptHistoryQuery = () => {
    return useQuery({
      queryKey: ['prompt-history'],
      queryFn: fetchPromptHistory,
      enabled: !!user,
    });
  };
  
  const useClearPromptHistory = () => {
    return useMutation({
      mutationFn: clearPromptHistory,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prompt-history'] });
      },
    });
  };
  
  return {
    useAISettingsQuery,
    useUpdateAISettings,
    usePromptHistoryQuery,
    useClearPromptHistory,
  };
};

export default useAISettings;

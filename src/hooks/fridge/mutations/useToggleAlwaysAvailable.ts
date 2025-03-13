
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "../types";
import { User } from "@supabase/supabase-js";

export const useToggleAlwaysAvailable = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, always_available }: { id: string; always_available: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log(`Toggling item ${id} always_available to: ${always_available}`);
      
      try {
        const { data: existingPrefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (prefsError && prefsError.code !== 'PGSQL_ERROR') {
          console.error("Error fetching user preferences:", prefsError);
          throw prefsError;
        }
        
        const existingPreferences = existingPrefs?.preferences || {};
        
        const safePrefs = typeof existingPreferences === 'object' 
          ? existingPreferences as Record<string, any> 
          : {};
                         
        const safeFridgeItemPrefs = typeof safePrefs.fridge_items === 'object' 
          ? safePrefs.fridge_items as Record<string, any> 
          : {};
        
        safeFridgeItemPrefs[id] = { 
          ...((typeof safeFridgeItemPrefs[id] === 'object' && safeFridgeItemPrefs[id]) || {}), 
          always_available 
        };
        
        const updatedPreferences = {
          ...safePrefs,
          fridge_items: safeFridgeItemPrefs
        };
        
        if (existingPrefs) {
          const { error: updateError } = await supabase
            .from('user_preferences')
            .update({ preferences: updatedPreferences })
            .eq('id', existingPrefs.id);
            
          if (updateError) {
            console.error("Error updating preferences:", updateError);
            throw updateError;
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              preferences: updatedPreferences
            });
            
          if (insertError) {
            console.error("Error inserting preferences:", insertError);
            throw insertError;
          }
        }
        
        return {
          id,
          name: "",
          user_id: user.id,
          created_at: new Date().toISOString(),
          always_available
        } as FridgeItem;
      } catch (error) {
        console.error("Error in toggleAlwaysAvailable:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      const status = data.always_available ? "marked as always available" : "no longer marked as always available";
      toast.success(`Item ${status}`);
    },
    onError: (error) => {
      console.error("Failed to update always_available:", error);
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
};

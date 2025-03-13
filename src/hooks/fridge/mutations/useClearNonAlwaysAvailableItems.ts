
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export const useClearNonAlwaysAvailableItems = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data: fridgeItems, error: fetchError } = await supabase
        .from('fridge_items' as any)
        .select("*")
        .eq("user_id", user.id);
      
      if (fetchError) throw fetchError;
      
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (prefsError && prefsError.code !== 'PGSQL_ERROR') {
        console.error("Error fetching user preferences:", prefsError);
        throw prefsError;
      }
      
      const alwaysAvailableIds: string[] = [];
      
      if (userPrefs && userPrefs.preferences) {
        const prefsObj = userPrefs.preferences as Record<string, any>;
        const fridgeItemPrefs = prefsObj.fridge_items || {};
        
        Object.entries(fridgeItemPrefs).forEach(([itemId, prefs]) => {
          const itemPrefs = prefs as Record<string, any>;
          if (itemPrefs && itemPrefs.always_available) {
            alwaysAvailableIds.push(itemId);
          }
        });
      }
      
      if (Array.isArray(fridgeItems)) {
        const itemsToDelete: string[] = [];
        
        for (const itemData of fridgeItems) {
          // Check if itemData is valid before accessing it
          if (itemData === null || typeof itemData !== 'object') {
            continue;
          }
          
          const item = itemData as Record<string, any>;
          
          // Additional check to ensure item and item.id are valid
          if (!item || typeof item.id !== 'string') {
            continue;
          }
          
          if (!alwaysAvailableIds.includes(item.id)) {
            itemsToDelete.push(item.id);
          }
        }
        
        if (itemsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('fridge_items' as any)
            .delete()
            .in("id", itemsToDelete);
          
          if (deleteError) throw deleteError;
        }
        
        return itemsToDelete.length;
      }
      
      return 0;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      toast.success(`Cleared ${count} non-saved items from your fridge`);
    },
    onError: (error) => {
      toast.error(`Failed to clear items: ${error.message}`);
    },
  });
};

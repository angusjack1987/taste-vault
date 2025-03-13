
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { FridgeItem } from "./types";

export const useFridgeItems = (user: User | null) => {
  return useQuery({
    queryKey: ["fridge-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: fridgeItems, error } = await supabase
        .from('fridge_items' as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (prefsError && prefsError.code !== 'PGSQL_ERROR') {
        console.error("Error fetching user preferences:", prefsError);
      }
      
      // Ensure fridgeItems is an array and not an error object
      const items = Array.isArray(fridgeItems) ? fridgeItems : [];
      
      // Filter out any null or non-object items
      // Using a simpler, more direct filtering approach
      const validItems = items.filter(item => 
        item !== null && typeof item === 'object' && 'id' in item
      );
      
      // Now map the valid items with preferences
      const itemsWithPrefs = validItems.map((item) => {
        if (!item || typeof item !== 'object') {
          return null; // Skip invalid items
        }
        
        const prefsObj = userPrefs && typeof userPrefs === 'object' && userPrefs.preferences 
          ? userPrefs.preferences 
          : {};
            
        const fridgeItemPrefs = typeof prefsObj === 'object' 
          ? (prefsObj as Record<string, any>).fridge_items || {} 
          : {};
          
        const itemId = 'id' in item && item.id ? item.id : '';
          
        const itemPrefs = typeof fridgeItemPrefs === 'object' && fridgeItemPrefs !== null
          ? (fridgeItemPrefs as Record<string, any>)[itemId] || {}
          : {};
        
        // Use type assertion after checking 'id' existence
        const validItem = item as unknown as Record<string, any>;
            
        return {
          ...validItem,
          always_available: Boolean(
            itemPrefs && 
            typeof itemPrefs === 'object' && 
            itemPrefs.always_available
          )
        } as FridgeItem;
      }).filter(Boolean) as FridgeItem[]; // Filter out any null items
      
      return itemsWithPrefs;
    },
    enabled: !!user,
  });
};

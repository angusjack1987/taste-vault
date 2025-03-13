
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { FridgeItem } from "./types";

// Define a more specific type for Supabase items
type SupabaseItem = {
  id: string;
  [key: string]: any;
};

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
      
      // Ensure fridgeItems is an array
      const items = Array.isArray(fridgeItems) ? fridgeItems : [];
      
      // Filter out null or invalid items - using a proper type guard
      const validItems = items.filter((item): item is SupabaseItem => 
        item !== null && typeof item === 'object' && 'id' in item
      );
      
      // Map items with preferences
      const itemsWithPrefs = validItems.map((item) => {
        const prefsObj = userPrefs && typeof userPrefs === 'object' && userPrefs.preferences 
          ? userPrefs.preferences 
          : {};
            
        const fridgeItemPrefs = typeof prefsObj === 'object' 
          ? (prefsObj as Record<string, any>).fridge_items || {} 
          : {};
        
        const itemId = item.id;
          
        const itemPrefs = typeof fridgeItemPrefs === 'object' && fridgeItemPrefs !== null
          ? (fridgeItemPrefs as Record<string, any>)[itemId] || {}
          : {};
        
        // Convert to FridgeItem type with proper object spreading
        return {
          ...item as unknown as Record<string, any>,
          always_available: Boolean(
            itemPrefs && 
            typeof itemPrefs === 'object' && 
            itemPrefs.always_available
          )
        } as FridgeItem;
      });
      
      return itemsWithPrefs;
    },
    enabled: !!user,
  });
};

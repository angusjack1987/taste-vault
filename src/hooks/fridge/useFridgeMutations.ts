
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "./types";
import { User } from "@supabase/supabase-js";
import { parseIngredientAmount } from "@/lib/ingredient-parser";

const categorizeItem = (itemName: string): string => {
  const name = itemName.toLowerCase();
  
  const freezerItems = [
    'frozen', 'ice', 'popsicle', 'ice cream', 'freezer', 
    'pizza', 'frozen meal', 'fish stick', 'fish fingers', 'frozen vegetable',
    'frozen fruit', 'icecream', 'peas', 'corn', 'berries'
  ];
  
  const pantryItems = [
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'cereal', 'cracker', 'cookie',
    'bean', 'lentil', 'canned', 'jar', 'spice', 'herb', 'oil', 'vinegar',
    'sauce', 'soup', 'mix', 'tea', 'coffee', 'cocoa', 'chocolate', 'snack',
    'chip', 'nut', 'dried', 'grain', 'bread', 'baking'
  ];
  
  for (const freezerItem of freezerItems) {
    if (name.includes(freezerItem)) {
      return 'Freezer';
    }
  }
  
  for (const pantryItem of pantryItems) {
    if (name.includes(pantryItem)) {
      return 'Pantry';
    }
  }
  
  return 'Fridge';
};

export const useFridgeMutations = (user: User | null) => {
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async (item: Omit<FridgeItem, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { always_available, ...dbItem } = item;
      
      const category = item.category || categorizeItem(item.name);
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .insert([
          {
            ...dbItem,
            category,
            user_id: user.id,
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as FridgeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      toast.success("Item added to your fridge");
    },
    onError: (error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });

  const updateItem = useMutation({
    mutationFn: async (item: Partial<FridgeItem> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { always_available, ...dbItem } = item;
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .update(dbItem)
        .eq("id", item.id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as FridgeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      toast.success("Item updated");
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  const toggleAlwaysAvailable = useMutation({
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
        
        let result;
        
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

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('fridge_items' as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      toast.success("Item removed from your fridge");
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  const clearNonAlwaysAvailableItems = useMutation({
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
        
        for (const item of fridgeItems) {
          // Skip null/invalid items
          if (item === null || typeof item !== 'object') {
            continue;
          }
          
          // Skip items without an id
          if (!('id' in item) || typeof item.id !== 'string') {
            continue;
          }
          
          // Check if the item is not in the "always available" list
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

  return {
    addItem,
    updateItem,
    deleteItem,
    toggleAlwaysAvailable,
    clearNonAlwaysAvailableItems
  };
};

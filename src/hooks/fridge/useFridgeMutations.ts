
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "./types";
import { User } from "@supabase/supabase-js";
import { parseIngredientAmount } from "@/lib/ingredient-parser";

// Helper function to categorize items based on their name
const categorizeItem = (itemName: string): string => {
  // Convert to lowercase for case-insensitive matching
  const name = itemName.toLowerCase();
  
  // Common freezer items
  const freezerItems = [
    'frozen', 'ice', 'popsicle', 'ice cream', 'freezer', 
    'pizza', 'frozen meal', 'fish stick', 'fish fingers', 'frozen vegetable',
    'frozen fruit', 'icecream', 'peas', 'corn', 'berries'
  ];
  
  // Common pantry items
  const pantryItems = [
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'cereal', 'cracker', 'cookie',
    'bean', 'lentil', 'canned', 'jar', 'spice', 'herb', 'oil', 'vinegar',
    'sauce', 'soup', 'mix', 'tea', 'coffee', 'cocoa', 'chocolate', 'snack',
    'chip', 'nut', 'dried', 'grain', 'bread', 'baking'
  ];
  
  // Check freezer items first
  for (const freezerItem of freezerItems) {
    if (name.includes(freezerItem)) {
      return 'Freezer';
    }
  }
  
  // Then check pantry items
  for (const pantryItem of pantryItems) {
    if (name.includes(pantryItem)) {
      return 'Pantry';
    }
  }
  
  // Default to Fridge for everything else
  return 'Fridge';
};

export const useFridgeMutations = (user: User | null) => {
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async (item: Omit<FridgeItem, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { always_available, ...dbItem } = item;
      
      // Automatically determine the category if not provided
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
        // First, check if the user already has preferences in the table
        const { data: existingPrefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle case when no record exists
          
        if (prefsError && prefsError.code !== 'PGSQL_ERROR') {
          console.error("Error fetching user preferences:", prefsError);
          throw prefsError;
        }
        
        // Initialize preferences structure
        const existingPreferences = existingPrefs?.preferences || {};
        
        const safePrefs = typeof existingPreferences === 'object' 
          ? existingPreferences as Record<string, any> 
          : {};
                         
        const safeFridgeItemPrefs = typeof safePrefs.fridge_items === 'object' 
          ? safePrefs.fridge_items as Record<string, any> 
          : {};
        
        // Update the specific item preference
        safeFridgeItemPrefs[id] = { 
          ...((typeof safeFridgeItemPrefs[id] === 'object' && safeFridgeItemPrefs[id]) || {}), 
          always_available 
        };
        
        // Prepare updated preferences object
        const updatedPreferences = {
          ...safePrefs,
          fridge_items: safeFridgeItemPrefs
        };
        
        let result;
        
        if (existingPrefs) {
          // If user already has preferences, update them
          const { error: updateError } = await supabase
            .from('user_preferences')
            .update({ preferences: updatedPreferences })
            .eq('id', existingPrefs.id);
            
          if (updateError) {
            console.error("Error updating preferences:", updateError);
            throw updateError;
          }
        } else {
          // If user doesn't have preferences yet, insert new record
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
      
      // First, get the current items
      const { data: fridgeItems, error: fetchError } = await supabase
        .from('fridge_items' as any)
        .select("*")
        .eq("user_id", user.id);
      
      if (fetchError) throw fetchError;
      
      // Get user preferences to identify always_available items
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (prefsError && prefsError.code !== 'PGSQL_ERROR') {
        console.error("Error fetching user preferences:", prefsError);
        throw prefsError;
      }
      
      // Extract always available item IDs
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
      
      // Delete all items that are not marked as always available
      if (Array.isArray(fridgeItems)) {
        // Create a safe list of IDs to delete
        const itemsToDelete: string[] = [];
        
        // Safely iterate through items with null checks
        fridgeItems.forEach(item => {
          if (item && 
              typeof item === 'object' && 
              'id' in item && 
              typeof item.id === 'string' && 
              !alwaysAvailableIds.includes(item.id)) {
            itemsToDelete.push(item.id);
          }
        });
        
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

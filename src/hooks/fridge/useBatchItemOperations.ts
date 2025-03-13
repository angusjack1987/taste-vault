
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { FridgeItem } from "./types";
import { parseIngredientAmount } from "@/lib/ingredient-parser";
import { supabase } from "@/integrations/supabase/client";

// Helper function to categorize items based on their name (copied for consistency)
const categorizeItem = (itemName: string): string => {
  // Convert to lowercase for case-insensitive matching
  const name = itemName.toLowerCase();
  
  // Common freezer items
  const freezerItems = [
    'frozen', 'ice', 'ice cream', 'freezer', 
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

export const useBatchItemOperations = (user: User | null) => {
  const queryClient = useQueryClient();

  const checkItemExists = async (itemName: string): Promise<boolean> => {
    if (!user || !itemName.trim()) return false;
    
    const { data, error } = await supabase
      .from('fridge_items' as any)
      .select("*")
      .eq("user_id", user.id)
      .ilike("name", itemName.trim());
    
    if (error) {
      console.error("Error checking item existence:", error);
      return false;
    }
    
    return (data && data.length > 0);
  };

  const processAndAddItem = async (itemText: string): Promise<boolean> => {
    if (!itemText.trim()) return false;
    
    const { name, amount } = parseIngredientAmount(itemText);
    
    if (!name) return false;
    
    const exists = await checkItemExists(name);
    
    if (exists) {
      console.log(`Item "${name}" already exists in fridge - skipping`);
      return false;
    }
    
    // Auto-determine category based on name
    const category = categorizeItem(name);
    
    try {
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .insert([
          {
            name: name,
            quantity: amount || undefined,
            category: category,
            user_id: user?.id,
          },
        ])
        .select();
      
      if (error) {
        console.error(`Error adding item "${name}":`, error);
        return false;
      }
      
      console.log(`Added item "${name}" successfully`);
      return true;
    } catch (error) {
      console.error(`Error adding item "${name}":`, error);
      return false;
    }
  };

  const batchAddItems = useMutation({
    mutationFn: async (items: string[]) => {
      if (!user) throw new Error("User not authenticated");
      
      if (!items || items.length === 0) {
        console.warn("No valid items to add");
        return [];
      }
      
      console.log("Processing items:", items);
      
      const addedCount = { success: 0, duplicates: 0, failed: 0 };
      const addedItems: FridgeItem[] = [];
      const duplicateItems: string[] = [];
      
      for (const itemText of items) {
        if (!itemText.trim()) continue;
        
        try {
          const added = await processAndAddItem(itemText);
          if (added) {
            addedCount.success++;
          } else {
            // If not added, it was likely a duplicate
            addedCount.duplicates++;
            duplicateItems.push(itemText);
          }
        } catch (error) {
          console.error(`Error adding item "${itemText}":`, error);
          addedCount.failed++;
        }
      }
      
      console.log("Batch add results:", addedCount);
      
      if (duplicateItems.length > 0) {
        console.log("Duplicate items not added:", duplicateItems);
      }
      
      return {
        addedItems,
        stats: addedCount
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      
      if (data.stats.success > 0) {
        toast.success(`Added ${data.stats.success} item${data.stats.success !== 1 ? 's' : ''} to your fridge`);
      }
      
      if (data.stats.duplicates > 0) {
        if (data.stats.duplicates === 1) {
          toast.info("1 item already exists in your fridge");
        } else if (data.stats.success === 0) {
          toast.info(`All ${data.stats.duplicates} items already exist in your fridge`);
        } else {
          toast.info(`${data.stats.duplicates} item${data.stats.duplicates !== 1 ? 's' : ''} already in your fridge`);
        }
      }
      
      if (data.stats.failed > 0) {
        toast.error(`Failed to add ${data.stats.failed} item${data.stats.failed !== 1 ? 's' : ''}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to add items: ${error.message}`);
    },
  });

  return {
    batchAddItems
  };
};

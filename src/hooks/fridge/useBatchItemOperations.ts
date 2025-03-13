
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { FridgeItem } from "./types";
import { parseIngredientAmount } from "@/lib/ingredient-parser";
import { supabase } from "@/integrations/supabase/client";

export const useBatchItemOperations = (user: User | null) => {
  const queryClient = useQueryClient();

  const checkItemExists = async (itemName: string): Promise<boolean> => {
    if (!user) return false;
    
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
    
    const { data, error } = await supabase
      .from('fridge_items' as any)
      .insert([
        {
          name: name,
          quantity: amount || undefined,
          category: 'Fridge',
          user_id: user?.id,
        },
      ])
      .select();
    
    if (error) {
      console.error(`Error adding item "${name}":`, error);
      return false;
    }
    
    return true;
  };

  const batchAddItems = useMutation({
    mutationFn: async (items: string[]) => {
      if (!user) throw new Error("User not authenticated");
      
      if (!items || items.length === 0) {
        throw new Error("No valid items to add");
      }
      
      console.log("Processing items:", items);
      
      const addedItems: FridgeItem[] = [];
      const duplicates: string[] = [];
      
      for (const itemText of items) {
        try {
          const added = await processAndAddItem(itemText);
          if (!added) {
            duplicates.push(itemText);
          }
        } catch (error) {
          console.error(`Error adding item "${itemText}":`, error);
        }
      }
      
      if (duplicates.length > 0) {
        console.log("Duplicate items not added:", duplicates);
        if (duplicates.length === items.length) {
          toast.info("All items already exist in your fridge");
        } else {
          toast.info(`${duplicates.length} item(s) already in your fridge`);
        }
      }
      
      return addedItems;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      if (data.length > 0) {
        toast.success(`Added items to your fridge`);
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

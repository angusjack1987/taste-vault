
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "../types";
import { User } from "@supabase/supabase-js";
import { categorizeItem } from "../utils/categorizeItem";
import { parseIngredientAmount, parsePreparation } from "@/lib/ingredient-parser";

export const useAddItem = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<FridgeItem, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { always_available, ...dbItem } = item;
      
      // If the item name contains a comma or parentheses, it might have preparation instructions
      // Let's try to parse it for a cleaner name
      let name = item.name;
      let quantity = item.quantity;
      
      if (item.name && (item.name.includes(',') || item.name.includes('(') || !item.quantity)) {
        // First parse for preparation (we don't need the preparation info for fridge items)
        const { mainText } = parsePreparation(item.name);
        // Then parse for amount
        const { name: parsedName, amount: parsedAmount } = parseIngredientAmount(mainText);
        
        if (parsedName) {
          name = parsedName;
          // Only use parsed quantity if none was provided
          if (!item.quantity && parsedAmount) {
            quantity = parsedAmount;
          }
        }
      }
      
      const category = item.category || categorizeItem(name);
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .insert([
          {
            ...dbItem,
            name,
            quantity,
            category,
            user_id: user.id,
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // No longer automatically syncs with connected users
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
};

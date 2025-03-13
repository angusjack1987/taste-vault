
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "../types";
import { User } from "@supabase/supabase-js";
import { categorizeItem } from "../utils/categorizeItem";

export const useAddItem = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
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
};


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "../types";
import { User } from "@supabase/supabase-js";

export const useUpdateItem = (user: User | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
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
      
      // No longer automatically syncs with connected users
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
};

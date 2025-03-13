
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FridgeItem } from "./types";
import { User } from "@supabase/supabase-js";
import { parseIngredientAmount } from "@/lib/ingredient-parser";

export const useFridgeMutations = (user: User | null) => {
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async (item: Omit<FridgeItem, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { always_available, ...dbItem } = item;
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .insert([
          {
            ...dbItem,
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
          .single();
          
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
        
        const prefsToUpsert = {
          user_id: user.id,
          preferences: {
            ...safePrefs,
            fridge_items: safeFridgeItemPrefs
          }
        };
        
        const { error: upsertError } = await supabase
          .from('user_preferences')
          .upsert(prefsToUpsert);
          
        if (upsertError) {
          console.error("Error upserting preferences:", upsertError);
          throw upsertError;
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

  return {
    addItem,
    updateItem,
    deleteItem,
    toggleAlwaysAvailable
  };
};


import { User } from "@supabase/supabase-js";
import { useAddItem } from "./mutations/useAddItem";
import { useUpdateItem } from "./mutations/useUpdateItem";
import { useDeleteItem } from "./mutations/useDeleteItem";
import { useToggleAlwaysAvailable } from "./mutations/useToggleAlwaysAvailable";
import { useClearNonAlwaysAvailableItems } from "./mutations/useClearNonAlwaysAvailableItems";

export const useFridgeMutations = (user: User | null) => {
  const addItem = useAddItem(user);
  const updateItem = useUpdateItem(user);
  const deleteItem = useDeleteItem(user);
  const toggleAlwaysAvailable = useToggleAlwaysAvailable(user);
  const clearNonAlwaysAvailableItems = useClearNonAlwaysAvailableItems(user);

  return {
    addItem,
    updateItem,
    deleteItem,
    toggleAlwaysAvailable,
    clearNonAlwaysAvailableItems
  };
};

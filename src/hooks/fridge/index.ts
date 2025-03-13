
import { useFridgeItems } from "./useFridgeItems";
import { useFridgeMutations } from "./useFridgeMutations";
import { useVoiceInput } from "./useVoiceInput";
import { useBatchItemOperations } from "./useBatchItemOperations";
import useAuth from "@/hooks/useAuth";

// Use 'export type' for TypeScript interfaces when isolatedModules is enabled
export type { FridgeItem } from "./types";

export const useFridge = () => {
  const { user } = useAuth();
  const { batchAddItems } = useBatchItemOperations(user);
  const { addItem, updateItem, deleteItem, toggleAlwaysAvailable } = useFridgeMutations(user);
  
  const handleItemsDetected = (items: string[]) => {
    batchAddItems.mutate(items);
  };
  
  const {
    isVoiceRecording,
    isProcessingVoice,
    startVoiceRecording,
    stopVoiceRecording,
    audioLevel,
  } = useVoiceInput(user, handleItemsDetected);

  return {
    useFridgeItems: () => useFridgeItems(user),
    addItem,
    updateItem,
    deleteItem,
    toggleAlwaysAvailable,
    batchAddItems,
    isVoiceRecording,
    isProcessingVoice,
    startVoiceRecording,
    stopVoiceRecording,
    audioLevel,
  };
};

export default useFridge;

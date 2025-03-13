
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FridgeItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  expiry_date?: string;
  user_id: string;
  created_at: string;
}

export const useFridge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Fetch fridge items
  const useFridgeItems = () => {
    return useQuery({
      queryKey: ["fridge-items", user?.id],
      queryFn: async () => {
        if (!user) return [];
        
        // Using type assertion to fix TypeScript error
        const { data, error } = await supabase
          .from('fridge_items' as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return (data || []) as unknown as FridgeItem[];
      },
      enabled: !!user,
    });
  };

  // Add item
  const addItem = useMutation({
    mutationFn: async (item: Omit<FridgeItem, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .insert([
          {
            ...item,
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

  // Update item
  const updateItem = useMutation({
    mutationFn: async (item: Partial<FridgeItem> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .update(item)
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

  // Delete item
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

  // Batch add items (from voice input)
  const batchAddItems = useMutation({
    mutationFn: async (itemsText: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // Parse items from text input
      // Simple parsing: Split by commas or newlines
      const itemNames = itemsText
        .split(/[,\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      const items = itemNames.map(name => ({
        name,
        user_id: user.id,
      }));
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .insert(items)
        .select();
      
      if (error) throw error;
      return (data || []) as unknown as FridgeItem[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      toast.success(`Added ${data.length} items to your fridge`);
    },
    onError: (error) => {
      toast.error(`Failed to add items: ${error.message}`);
    },
  });

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      });
      
      recorder.addEventListener("stop", async () => {
        // Convert audio chunks to a single blob
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1];
          if (base64Audio) {
            try {
              const response = await supabase.functions.invoke("transcribe-voice", {
                body: { audio: base64Audio },
              });
              
              if (response.error) {
                throw new Error(response.error.message);
              }
              
              if (response.data.text) {
                batchAddItems.mutate(response.data.text);
              }
            } catch (error: any) {
              console.error("Transcription error:", error);
              toast.error(`Failed to transcribe your voice note: ${error.message}`);
            }
          }
        };
        
        // Clear the audio chunks
        setAudioChunks([]);
        setIsVoiceRecording(false);
      });
      
      recorder.start();
      setIsVoiceRecording(true);
    } catch (error: any) {
      console.error("Error starting voice recording:", error);
      toast.error(`Failed to access microphone: ${error.message}`);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isVoiceRecording) {
      mediaRecorder.stop();
      
      // Stop all audio tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  return {
    useFridgeItems,
    addItem,
    updateItem,
    deleteItem,
    batchAddItems,
    isVoiceRecording,
    startVoiceRecording,
    stopVoiceRecording,
  };
};

export default useFridge;

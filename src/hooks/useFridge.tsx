
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parseIngredientAmount } from "@/lib/ingredient-parser";

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

  // Check if item already exists in fridge
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

  // Process and add items from the ingredient text, considering duplicates
  const processAndAddItem = async (itemText: string): Promise<boolean> => {
    if (!itemText.trim()) return false;
    
    // Parse the ingredient to separate name and quantity
    const { name, amount } = parseIngredientAmount(itemText);
    
    if (!name) return false;
    
    // Check if the item already exists in the fridge
    const exists = await checkItemExists(name);
    
    if (exists) {
      console.log(`Item "${name}" already exists in fridge - skipping`);
      return false;
    }
    
    // If it doesn't exist, prepare the item for addition
    const newItem = {
      name: name,
      quantity: amount || undefined,
      category: 'Fridge' // Default category
    };
    
    await addItem.mutateAsync(newItem);
    return true;
  };

  // Batch add items (from voice input)
  const batchAddItems = useMutation({
    mutationFn: async (items: string[]) => {
      if (!user) throw new Error("User not authenticated");
      
      if (!items || items.length === 0) {
        throw new Error("No valid items to add");
      }
      
      console.log("Processing items:", items);
      
      // Process each item, checking for duplicates
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
      
      // Show message about duplicates if any
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

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset audio chunks state
      setAudioChunks([]);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      });
      setMediaRecorder(recorder);
      
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          setAudioChunks((previousChunks) => [...previousChunks, event.data]);
        }
      });
      
      recorder.addEventListener("stop", async () => {
        try {
          // Verify we have audio data
          if (audioChunks.length === 0) {
            console.error("No audio chunks recorded");
            toast.error("No audio recorded. Please try again and speak clearly.");
            setIsVoiceRecording(false);
            return;
          }
          
          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          console.log("Audio blob created:", audioBlob.size, "bytes");
          
          if (audioBlob.size === 0) {
            console.error("Empty audio blob created");
            toast.error("No audio recorded. Please try again and speak clearly.");
            setIsVoiceRecording(false);
            return;
          }
          
          // Convert blob to base64
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            try {
              if (!reader.result) {
                throw new Error("FileReader result is null");
              }
              
              const base64Audio = reader.result.toString().split(",")[1];
              
              if (!base64Audio) {
                throw new Error("Failed to convert audio to base64");
              }
              
              console.log("Base64 audio length:", base64Audio.length);
              
              if (base64Audio.length === 0) {
                throw new Error("Empty base64 audio data");
              }
              
              console.log("Sending audio to transcription service...");
              
              const response = await supabase.functions.invoke("transcribe-voice", {
                body: { audio: base64Audio },
              });
              
              console.log("Transcription response:", response);
              
              if (response.error) {
                throw new Error(response.error.message || "Transcription failed");
              }
              
              if (response.data) {
                const transcribedText = response.data.text?.trim();
                const foodItems = response.data.foodItems || [];
                
                console.log("Transcribed text:", transcribedText);
                console.log("Extracted food items:", foodItems);
                
                if (foodItems && foodItems.length > 0) {
                  toast.success("Voice note transcribed successfully");
                  batchAddItems.mutate(foodItems);
                } else if (transcribedText) {
                  // Fallback to using the full text if no food items were extracted
                  toast.info("Processing full transcription as no specific items were detected");
                  batchAddItems.mutate([transcribedText]);
                } else {
                  toast.error("Could not understand speech. Please try again and speak clearly.");
                }
              } else {
                throw new Error("No transcription returned");
              }
            } catch (error: any) {
              console.error("Error processing transcription:", error);
              toast.error(`Failed to process voice note: ${error.message}`);
            } finally {
              setIsVoiceRecording(false);
            }
          };
          
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            toast.error("Failed to process audio recording");
            setIsVoiceRecording(false);
          };
          
          // Start the reading process
          reader.readAsDataURL(audioBlob);
        } catch (error: any) {
          console.error("Error creating audio blob:", error);
          toast.error(`Failed to process recording: ${error.message}`);
          setIsVoiceRecording(false);
        }
      });
      
      // Start recording with small timeslice to get frequent dataavailable events
      recorder.start(500); // Get data every 500ms for more reliable chunking
      setIsVoiceRecording(true);
      toast.info("Recording started. Speak clearly to add items.");
    } catch (error: any) {
      console.error("Error starting voice recording:", error);
      toast.error(`Failed to access microphone: ${error.message}`);
      setIsVoiceRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      console.log("Stopping voice recording...");
      mediaRecorder.stop();
      
      // Stop all audio tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Audio track stopped");
        });
      }
    } else {
      console.warn("No active recording to stop");
      setIsVoiceRecording(false);
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

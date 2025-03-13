
import { useState, useRef, useEffect } from "react";
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
  always_available?: boolean;
  user_id: string;
  created_at: string;
}

export const useFridge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Audio analyzer for visualizations
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up audio processing on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Audio level analyzer function
  const analyzeAudioLevel = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average volume level from frequency data
      const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / 
                     dataArrayRef.current.length;
      
      // Normalize to 0-1 range and update state
      const normalizedLevel = average / 255;
      setAudioLevel(normalizedLevel);
      
      // Continue analyzing if still recording
      if (isVoiceRecording) {
        animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
      } else {
        setAudioLevel(0);
      }
    }
  };

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

  // Toggle "always available" status
  const toggleAlwaysAvailable = useMutation({
    mutationFn: async ({ id, always_available }: { id: string; always_available: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('fridge_items' as any)
        .update({ always_available })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as FridgeItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fridge-items", user?.id] });
      const status = data.always_available ? "marked as always available" : "no longer marked as always available";
      toast.success(`"${data.name}" ${status}`);
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
      // Reset audio state for new recording
      setAudioChunks([]);
      setIsVoiceRecording(true);
      setAudioLevel(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analyzer for visualizations
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start audio level analysis
      analyzeAudioLevel();
      
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
          setIsVoiceRecording(false);
          setIsProcessingVoice(true);
          
          // Stop audio visualization
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          
          // Get the latest audio chunks
          const currentChunks = audioChunks;
          console.log(`Processing ${currentChunks.length} audio chunks`);
          
          if (currentChunks.length === 0) {
            console.error("No audio chunks recorded");
            toast.error("No audio recorded. Please try again and speak clearly.");
            setIsProcessingVoice(false);
            return;
          }
          
          // Create audio blob from chunks
          const audioBlob = new Blob(currentChunks, { type: "audio/webm" });
          console.log("Audio blob created:", audioBlob.size, "bytes");
          
          if (audioBlob.size === 0) {
            console.error("Empty audio blob created");
            toast.error("No audio recorded. Please try again and speak clearly.");
            setIsProcessingVoice(false);
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
              // Clear audio chunks after processing to prevent reuse
              setAudioChunks([]);
              setIsProcessingVoice(false);
            }
          };
          
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            toast.error("Failed to process audio recording");
            setAudioChunks([]);
            setIsProcessingVoice(false);
          };
          
          // Start the reading process
          reader.readAsDataURL(audioBlob);
        } catch (error: any) {
          console.error("Error creating audio blob:", error);
          toast.error(`Failed to process recording: ${error.message}`);
          setAudioChunks([]);
          setIsProcessingVoice(false);
        }
      });
      
      // Start recording with small timeslice to get frequent dataavailable events
      recorder.start(500); // Get data every 500ms for more reliable chunking
      toast.info("Recording started. Speak clearly to add items.");
    } catch (error: any) {
      console.error("Error starting voice recording:", error);
      toast.error(`Failed to access microphone: ${error.message}`);
      setIsVoiceRecording(false);
      setIsProcessingVoice(false);
    }
  };

  const stopVoiceRecording = () => {
    // Stop audio level visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setAudioLevel(0);
    
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
    toggleAlwaysAvailable,
    batchAddItems,
    isVoiceRecording,
    isProcessingVoice,
    startVoiceRecording,
    stopVoiceRecording,
    audioLevel, // Export audio level for visualization
  };
};

export default useFridge;

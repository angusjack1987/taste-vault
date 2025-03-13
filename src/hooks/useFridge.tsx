
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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  const analyzeAudioLevel = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / 
                     dataArrayRef.current.length;
      
      const normalizedLevel = average / 255;
      setAudioLevel(normalizedLevel);
      
      if (isVoiceRecording) {
        animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
      } else {
        setAudioLevel(0);
      }
    }
  };

  const useFridgeItems = () => {
    return useQuery({
      queryKey: ["fridge-items", user?.id],
      queryFn: async () => {
        if (!user) return [];
        
        const { data: fridgeItems, error } = await supabase
          .from('fridge_items' as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        const { data: userPrefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (prefsError && prefsError.code !== 'PGSQL_ERROR') {
          console.error("Error fetching user preferences:", prefsError);
        }
        
        const items = Array.isArray(fridgeItems) ? fridgeItems : [];
        
        const itemsWithPrefs = items
          .filter(item => item !== null && typeof item === 'object')
          .map(item => {
            // At this point item is guaranteed to be a non-null object
            const prefsObj = userPrefs && typeof userPrefs === 'object' && userPrefs.preferences 
              ? userPrefs.preferences 
              : {};
              
            const fridgeItemPrefs = typeof prefsObj === 'object' 
              ? (prefsObj as Record<string, any>).fridge_items || {} 
              : {};
            
            // Now we know item is an object so we can safely access its properties
            const itemId = item.id || '';
            
            const itemPrefs = typeof fridgeItemPrefs === 'object' && fridgeItemPrefs !== null
              ? (fridgeItemPrefs as Record<string, any>)[itemId] || {}
              : {};
              
            return {
              ...item,
              always_available: Boolean(
                itemPrefs && 
                typeof itemPrefs === 'object' && 
                itemPrefs.always_available
              )
            } as FridgeItem;
          });
        
        return itemsWithPrefs;
      },
      enabled: !!user,
    });
  };

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
    
    const newItem = {
      name: name,
      quantity: amount || undefined,
      category: 'Fridge'
    };
    
    await addItem.mutateAsync(newItem);
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

  const startVoiceRecording = async () => {
    try {
      setAudioChunks([]);
      setIsVoiceRecording(true);
      setAudioLevel(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
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
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          
          const currentChunks = audioChunks;
          console.log(`Processing ${currentChunks.length} audio chunks`);
          
          if (currentChunks.length === 0) {
            console.error("No audio chunks recorded");
            toast.error("No audio recorded. Please try again and speak clearly.");
            setIsProcessingVoice(false);
            return;
          }
          
          const audioBlob = new Blob(currentChunks, { type: "audio/webm" });
          console.log("Audio blob created:", audioBlob.size, "bytes");
          
          if (audioBlob.size === 0) {
            console.error("Empty audio blob created");
            toast.error("No audio recorded. Please try again and speak clearly.");
            setIsProcessingVoice(false);
            return;
          }
          
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
          
          reader.readAsDataURL(audioBlob);
        } catch (error: any) {
          console.error("Error creating audio blob:", error);
          toast.error(`Failed to process recording: ${error.message}`);
          setAudioChunks([]);
          setIsProcessingVoice(false);
        }
      });
      
      recorder.start(500);
      toast.info("Recording started. Speak clearly to add items.");
    } catch (error: any) {
      console.error("Error starting voice recording:", error);
      toast.error(`Failed to access microphone: ${error.message}`);
      setIsVoiceRecording(false);
      setIsProcessingVoice(false);
    }
  };

  const stopVoiceRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setAudioLevel(0);
    
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      console.log("Stopping voice recording...");
      mediaRecorder.stop();
      
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
    audioLevel,
  };
};

export default useFridge;

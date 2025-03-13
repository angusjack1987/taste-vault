
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export const useVoiceInput = (user: User | null, onItemsDetected: (items: string[]) => void) => {
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
                  onItemsDetected(foodItems);
                } else if (transcribedText) {
                  toast.info("Processing full transcription as no specific items were detected");
                  onItemsDetected([transcribedText]);
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
    isVoiceRecording,
    isProcessingVoice,
    startVoiceRecording,
    stopVoiceRecording,
    audioLevel,
  };
};

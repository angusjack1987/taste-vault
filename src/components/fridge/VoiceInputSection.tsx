
import React from "react";
import { AudioWaveform, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VoiceInputSectionProps {
  isVoiceRecording: boolean;
  isProcessingVoice: boolean;
  audioLevel: number;
  processingProgress: number;
  stopVoiceRecording: () => void;
}

const VoiceInputSection = ({ 
  isVoiceRecording, 
  isProcessingVoice, 
  audioLevel,
  processingProgress,
  stopVoiceRecording 
}: VoiceInputSectionProps) => {
  return (
    <>
      {isVoiceRecording && (
        <div className="bg-secondary/20 p-4 rounded-xl text-center relative overflow-hidden">
          <p className="mb-2 text-sm">Recording... Speak clearly to add items</p>
          
          {/* Voice amplitude visualization */}
          <div className="flex items-center justify-center h-12 mb-2">
            {Array.from({ length: 9 }).map((_, i) => {
              // Calculate animation delay and height based on position
              const delay = `${i * 50}ms`;
              const height = audioLevel > 0 
                ? Math.min(100, 30 + (audioLevel * 70 * Math.sin((i + 1) * 0.7))) 
                : 30 + (30 * Math.sin((i + 1) * 0.7));
                
              return (
                <div 
                  key={i} 
                  className="mx-0.5 w-1 bg-primary rounded-full animate-sound-wave"
                  style={{ 
                    height: `${height}%`, 
                    animationDelay: delay,
                    transform: `scaleY(${audioLevel > 0 ? (0.5 + audioLevel * 0.5) : 0.5})`
                  }}
                />
              );
            })}
          </div>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={stopVoiceRecording}
            className="gap-1 rounded-full"
          >
            <X className="h-4 w-4" /> Stop Recording
          </Button>
        </div>
      )}

      {isProcessingVoice && !isVoiceRecording && (
        <div className="bg-secondary/20 p-4 rounded-xl text-center animate-fade-in">
          <p className="mb-2 text-sm">Processing your voice input...</p>
          <div className="my-4">
            <Progress value={processingProgress} className="h-2" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Identifying food items</span>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceInputSection;

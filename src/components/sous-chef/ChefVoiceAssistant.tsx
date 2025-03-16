import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Volume2, ChefHat, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChefVoiceAssistantProps {
  className?: string;
}

const ChefVoiceAssistant: React.FC<ChefVoiceAssistantProps> = ({ className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = (event: any) => {
    // Handle response audio
    if (event.type === 'response.audio.delta') {
      if (!isSpeaking) setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    }
    
    // Handle text transcript
    if (event.type === 'response.audio_transcript.delta' && event.delta) {
      setTranscriptText(prev => prev + event.delta);
    } else if (event.type === 'response.audio_transcript.done') {
      // Transcript complete, keep it displayed for a while then clear
      setTimeout(() => {
        setTranscriptText('');
      }, 5000);
    }
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Get ephemeral token from Supabase Edge Function
      const response = await supabase.functions.invoke('realtime-chef-assistant');
      if (!response.data || !response.data.client_secret?.value) {
        throw new Error('Failed to get ephemeral token');
      }
      
      // Initialize chat with OpenAI
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init(response.data.client_secret.value);
      
      setIsConnected(true);
      setIsConnecting(false);
      
      toast.success("Chef Assistant is ready!", {
        description: "Ask me any cooking questions!",
        icon: <ChefHat className="text-primary" />,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnecting(false);
      
      toast.error("Couldn't connect to Chef Assistant", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscriptText('');
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative flex justify-center items-center gap-4 mb-2">
        {/* Voice Status Display */}
        <div className="flex items-center justify-center">
          {isConnected && (
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full w-12 h-12 border-2 relative overflow-hidden transition-all duration-300 
                ${isListening ? 'border-red-500 bg-red-100' : 'border-primary'}
                ${isSpeaking ? 'border-blue-500 bg-blue-100' : ''}
              `}
              onClick={isConnected ? () => setIsListening(!isListening) : undefined}
            >
              {isListening ? (
                <Mic className="h-5 w-5 text-red-500" />
              ) : isSpeaking ? (
                <Volume2 className="h-5 w-5 text-blue-500" />
              ) : (
                <Mic className="h-5 w-5 text-muted-foreground" />
              )}
              
              {/* Animated circles for voice activity */}
              {(isListening || isSpeaking) && (
                <>
                  <span className={`absolute inset-0 border-2 rounded-full animate-ping opacity-20 
                    ${isListening ? 'border-red-500' : 'border-blue-500'}`}
                  />
                  <span className={`absolute inset-0 border-2 rounded-full animate-pulse opacity-40
                    ${isListening ? 'border-red-500' : 'border-blue-500'}`}
                  />
                </>
              )}
            </Button>
          )}
          
          {!isConnected && (
            <Button 
              onClick={startConversation}
              disabled={isConnecting}
              className="rounded-full px-4 flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChefHat className="h-4 w-4" />
              )}
              <span>{isConnecting ? "Connecting..." : "Ask Chef"}</span>
            </Button>
          )}
          
          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={endConversation}
              className="ml-2"
            >
              <MicOff className="h-4 w-4 mr-1" />
              <span>End</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Voice Transcript */}
      {transcriptText && (
        <div className="text-center text-sm font-medium italic bg-muted/50 px-4 py-2 rounded-full mb-4 max-w-sm overflow-hidden animate-fade-in">
          "{transcriptText}"
        </div>
      )}
    </div>
  );
};

export default ChefVoiceAssistant;

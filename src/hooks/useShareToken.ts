
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export function useShareToken(user: User | null, dialogOpen: boolean) {
  const [shareToken, setShareToken] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate a share URL that includes the user's ID and a token
  const shareUrl = user && shareToken ? `${window.location.origin}/connect-profile/${user.id}?token=${shareToken}` : '';
  
  // Fetch the existing token when the dialog opens
  useEffect(() => {
    if (dialogOpen && user) {
      setIsLoading(true);
      fetchShareToken();
    }
  }, [dialogOpen, user]);
  
  const fetchShareToken = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Fetching share token for user", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('share_token')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching share token:", error);
        generateShareToken();
        return;
      }
      
      console.log("Share token data:", data);
      
      if (data && data.share_token) {
        setShareToken(data.share_token);
      } else {
        // No token exists yet, generate one
        console.log("No existing token found, generating new one");
        generateShareToken();
      }
    } catch (error) {
      console.error("Error fetching share token:", error);
      // If there's an error, try to generate a new token
      generateShareToken();
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateShareToken = async () => {
    if (!user) return;
    
    setIsRegenerating(true);
    
    try {
      // Generate a random token
      const newToken = Math.random().toString(36).substring(2, 15);
      console.log("Generated new share token:", newToken);
      
      // Save the token to the user's profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          share_token: newToken
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error generating share token:", error);
        throw error;
      }
      
      setShareToken(newToken);
      toast({
        title: "Share link updated",
        description: "Your sharing link has been regenerated successfully."
      });
    } catch (error) {
      console.error("Error generating share token:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new sharing link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return {
    shareToken,
    shareUrl,
    isRegenerating,
    isLoading,
    generateShareToken,
    fetchShareToken
  };
}

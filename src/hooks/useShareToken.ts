
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export function useShareToken(user: User | null, dialogOpen: boolean) {
  const [shareToken, setShareToken] = useState<string>("");
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
        createStaticToken();
        return;
      }
      
      console.log("Share token data:", data);
      
      if (data && data.share_token) {
        setShareToken(data.share_token);
      } else {
        // No token exists yet, generate one
        console.log("No existing token found, generating new one");
        createStaticToken();
      }
    } catch (error) {
      console.error("Error fetching share token:", error);
      // If there's an error, try to generate a new token
      createStaticToken();
    } finally {
      setIsLoading(false);
    }
  };
  
  const createStaticToken = async () => {
    if (!user) return;
    
    try {
      // Generate a simple static token using the first part of user ID
      const newToken = user.id.split('-')[0];
      console.log("Generated static share token:", newToken);
      
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
    } catch (error) {
      console.error("Error generating share token:", error);
      toast({
        title: "Error",
        description: "Failed to generate sharing link. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return {
    shareToken,
    shareUrl,
    isLoading,
    fetchShareToken
  };
}


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

type ConnectionStatus = 'not_connected' | 'connected' | 'self' | 'not_found' | 'invalid_token';

interface UseProfileConnectionResult {
  connectionStatus: ConnectionStatus;
  ownerName: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  handleConnect: () => Promise<void>;
}

export const useProfileConnection = (
  ownerId: string | undefined,
  token: string | null,
  user: User | null,
  navigate: (path: string, options?: { state: any }) => void
): UseProfileConnectionResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('not_connected');

  useEffect(() => {
    const checkConnection = async () => {
      if (!ownerId) {
        console.log("No owner ID provided");
        setConnectionStatus('not_found');
        setIsLoading(false);
        return;
      }

      if (user?.id === ownerId) {
        console.log("Self-connection detected");
        setConnectionStatus('self');
        setIsLoading(false);
        return;
      }

      try {
        console.log("Checking connection for owner:", ownerId);
        console.log("Current user:", user?.id);
        
        // First, verify the owner profile exists and token is valid
        const { data: ownerProfile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, share_token')
          .eq('id', ownerId)
          .single();
        
        if (profileError || !ownerProfile) {
          console.log('Profile not found or error:', profileError);
          setConnectionStatus('not_found');
          setIsLoading(false);
          return;
        }
        
        console.log("Owner profile data:", ownerProfile);
        console.log("Token provided:", token);
        console.log("Token in DB:", ownerProfile.share_token);

        // Check token validity
        const isTokenValid = !token || ownerProfile.share_token === token;
        
        if (!isTokenValid) {
          console.log('Token validation failed');
          setConnectionStatus('invalid_token');
          setIsLoading(false);
          return;
        }

        // Token is valid and owner profile exists
        setOwnerName(ownerProfile.first_name || 'User');

        // If logged in, check if already connected
        if (user) {
          // Check for existing connection in profile_sharing table
          const { data: existingConnection, error: connectionError } = await supabase
            .from('profile_sharing')
            .select('*')
            .or(`user_id_1.eq.${ownerId},user_id_2.eq.${ownerId}`)
            .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
            .maybeSingle();

          console.log("Existing connection:", existingConnection, "Error:", connectionError);

          if (existingConnection) {
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('not_connected');
          }
        } else {
          setConnectionStatus('not_connected');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        toast({
          title: "Error",
          description: "Could not check connection status. Please try again.",
          variant: "destructive",
        });
        setConnectionStatus('not_connected');
      } finally {
        setIsLoading(false);
      }
    };

    // Reset loading state when dependencies change
    setIsLoading(true);
    checkConnection();
  }, [ownerId, user, token]);

  const handleConnect = async () => {
    if (!user || !ownerId) {
      // Redirect to login with return URL
      const returnUrl = `/connect-profile/${ownerId}${token ? `?token=${token}` : ''}`;
      console.log("Redirecting to login with return URL:", returnUrl);
      
      navigate('/auth/login', { 
        state: { returnUrl } 
      });
      return;
    }
    
    // Prevent connecting to your own profile
    if (user.id === ownerId) {
      toast({
        title: "Cannot connect",
        description: "You cannot connect to your own profile.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('profile_sharing')
        .select('*')
        .or(`user_id_1.eq.${ownerId},user_id_2.eq.${ownerId}`)
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .maybeSingle();

      if (existingConnection) {
        console.log("Connection already exists:", existingConnection);
        setConnectionStatus('connected');
        toast({
          title: "Already connected",
          description: `You are already connected with ${ownerName}'s profile.`,
        });
      } else {
        console.log("Creating new bidirectional connection");
        // Create a new bidirectional connection
        // We store both users in the same row to represent a bidirectional connection
        const { error: insertError } = await supabase
          .from('profile_sharing')
          .insert([{
            user_id_1: user.id,
            user_id_2: ownerId,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        setConnectionStatus('connected');
        toast({
          title: "Connected successfully!",
          description: `You are now synced with ${ownerName}'s profile. All recipes and meal plans will be shared.`,
        });
      }
    } catch (error) {
      console.error('Error connecting profiles:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connectionStatus,
    ownerName,
    isLoading,
    isConnecting,
    handleConnect
  };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

type ConnectionStatus = 'not_connected' | 'pending' | 'connected' | 'self' | 'not_found' | 'invalid_token';

interface UseProfileConnectionResult {
  connectionStatus: ConnectionStatus;
  ownerName: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  validToken: boolean;
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
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (!ownerId) {
        setConnectionStatus('not_found');
        setIsLoading(false);
        return;
      }

      if (user?.id === ownerId) {
        setConnectionStatus('self');
        setIsLoading(false);
        return;
      }

      try {
        // First, verify the token is valid for this owner
        const { data: ownerProfile, error: tokenError } = await supabase
          .from('profiles')
          .select('first_name, share_token')
          .eq('id', ownerId)
          .single();
        
        console.log("Owner profile data:", ownerProfile);
        console.log("Token provided:", token);
        console.log("Token in DB:", ownerProfile?.share_token);

        // If we can't find the profile or the token doesn't match
        if (!ownerProfile) {
          console.log('Profile not found');
          setConnectionStatus('not_found');
          setIsLoading(false);
          return;
        }
        
        // If token is required but doesn't match
        if (token && ownerProfile.share_token !== token) {
          console.log('Token validation failed:', { provided: token, stored: ownerProfile?.share_token });
          setConnectionStatus('invalid_token');
          setIsLoading(false);
          return;
        }

        // Token is valid or not required
        setValidToken(true);
        setOwnerName(ownerProfile.first_name || 'User');

        // If logged in, check if already connected
        if (user) {
          // Check for any existing connection between these users (in either direction)
          const { data: existingConnection } = await supabase
            .from('profile_sharing')
            .select('*')
            .or(`and(owner_id.eq.${ownerId},shared_with_id.eq.${user.id}),and(owner_id.eq.${user.id},shared_with_id.eq.${ownerId})`)
            .single();

          if (existingConnection) {
            setConnectionStatus(existingConnection.status === 'active' ? 'connected' : 'pending');
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        toast({
          title: "Error",
          description: "Could not check connection status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [ownerId, user, token]);

  const handleConnect = async () => {
    if (!user || !ownerId) {
      // Construct the full return URL with token
      const returnUrl = `/connect-profile/${ownerId}${token ? `?token=${token}` : ''}`;
      console.log("Redirecting to login with return URL:", returnUrl);
      
      navigate('/auth/login', { 
        state: { returnUrl } 
      });
      return;
    }

    if (!validToken) {
      toast({
        title: "Invalid Link",
        description: "This sharing link is invalid or has expired.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Check for existing invitations by email
      const { data: existingInvitation } = await supabase
        .from('profile_sharing')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('shared_with_email', user.email)
        .single();

      if (existingInvitation) {
        console.log("Updating existing invitation:", existingInvitation);
        // Update the existing invitation with the user's ID and set status to active
        const { error: updateError } = await supabase
          .from('profile_sharing')
          .update({
            shared_with_id: user.id,
            status: 'active',
          })
          .eq('id', existingInvitation.id);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new connection");
        // Create a new connection if no invitation exists
        const { error: insertError } = await supabase
          .from('profile_sharing')
          .insert([{
            owner_id: ownerId,
            shared_with_id: user.id,
            shared_with_email: user.email,
            status: 'active'
          }]);

        if (insertError) throw insertError;
      }

      setConnectionStatus('connected');
      toast({
        title: "Connected successfully!",
        description: `You are now connected with ${ownerName}'s profile.`,
      });
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
    validToken,
    handleConnect
  };
};

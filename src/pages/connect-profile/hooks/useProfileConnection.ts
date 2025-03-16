
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
        
        // First, verify the token is valid for this owner by fetching the profile
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

        // Check token validity - either it matches or we don't need to check it
        const isTokenValid = !token || ownerProfile.share_token === token;
        
        if (!isTokenValid) {
          console.log('Token validation failed:', { provided: token, stored: ownerProfile.share_token });
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
          const { data: existingConnection, error: connectionError } = await supabase
            .from('profile_sharing')
            .select('status')
            .or(`and(owner_id.eq.${ownerId},shared_with_email.eq.${user.email}),and(owner_id.eq.${user.id},shared_with_email.eq.${ownerProfile.email})`)
            .maybeSingle();

          console.log("Existing connection:", existingConnection, "Error:", connectionError);

          if (existingConnection) {
            setConnectionStatus(existingConnection.status === 'active' ? 'connected' : 'pending');
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
      // Fetch the owner's email for the sharing record
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', ownerId)
        .single();
      
      const ownerEmail = ownerData?.email;

      // Check for existing invitations by email
      const { data: existingInvitation } = await supabase
        .from('profile_sharing')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('shared_with_email', user.email)
        .maybeSingle();

      if (existingInvitation) {
        console.log("Updating existing invitation:", existingInvitation);
        // Update the existing invitation with the user's ID and set status to active
        const { error: updateError } = await supabase
          .from('profile_sharing')
          .update({
            status: 'active',
          })
          .eq('id', existingInvitation.id);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new connection");
        // Create a new connection
        const { error: insertError } = await supabase
          .from('profile_sharing')
          .insert([{
            owner_id: ownerId,
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

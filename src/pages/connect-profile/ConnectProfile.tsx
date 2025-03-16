
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

const ConnectProfile = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'not_connected' | 'pending' | 'connected' | 'self' | 'not_found'>('not_connected');
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

        // If we can't find the profile or the token doesn't match
        if (!ownerProfile || (token && ownerProfile.share_token !== token)) {
          console.log('Token validation failed:', { provided: token, stored: ownerProfile?.share_token });
          setConnectionStatus('not_found');
          setIsLoading(false);
          return;
        }

        // Token is valid or not required
        setValidToken(true);
        setOwnerName(ownerProfile.first_name || 'User');

        // If logged in, check if already connected
        if (user) {
          const { data: existingConnection } = await supabase
            .from('profile_sharing')
            .select('status')
            .or(`owner_id.eq.${ownerId},shared_with_id.eq.${ownerId}`)
            .or(`owner_id.eq.${user.id},shared_with_id.eq.${user.id}`)
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
      navigate('/auth/login', { state: { returnUrl: `/connect-profile/${ownerId}${token ? `?token=${token}` : ''}` } });
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
      // Update an existing invitation if the current user was invited
      const { data: existingInvitation } = await supabase
        .from('profile_sharing')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('shared_with_email', user.email)
        .single();

      if (existingInvitation) {
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
        // Create a new connection if no invitation exists
        const { error: insertError } = await supabase
          .from('profile_sharing')
          .insert([{
            owner_id: ownerId,
            shared_with_id: user.id,
            shared_with_email: user.email,
            status: 'active'
          }] as any);

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Checking connection status...</p>
        </div>
      );
    }

    if (connectionStatus === 'not_found') {
      return (
        <Card className="w-full max-w-md border-2 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl">Profile Not Found</CardTitle>
            <CardDescription>
              The profile you're trying to connect with doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate('/')}
              className="w-full rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              Go Home
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (connectionStatus === 'self') {
      return (
        <Card className="w-full max-w-md border-2 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl">This is Your Profile</CardTitle>
            <CardDescription>
              You can't connect with your own profile. Share this link with someone else to connect with them.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate('/settings/profile-sharing')}
              className="w-full rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              Manage Profile Sharing
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (connectionStatus === 'connected') {
      return (
        <Card className="w-full max-w-md border-2 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl">Profiles Connected!</CardTitle>
            <CardDescription>
              You are connected with {ownerName}'s profile. You can now share recipes, meal plans, and shopping lists.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate('/settings/profile-sharing')}
              className="w-full rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              Manage Profile Sharing
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (connectionStatus === 'pending') {
      return (
        <Card className="w-full max-w-md border-2 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl">Pending Connection</CardTitle>
            <CardDescription>
              Your connection with {ownerName}'s profile is pending. Please wait for them to approve it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate('/settings/profile-sharing')}
              className="w-full rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              View Status
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md border-2 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-xl">Connect with {ownerName}</CardTitle>
          <CardDescription>
            {!user 
              ? "Sign in or create an account to connect with this profile." 
              : `Connect with ${ownerName}'s profile to share recipes, meal plans, and shopping lists.`}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            {isConnecting 
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
              : <><UserPlus className="mr-2 h-4 w-4" /> {user ? "Connect" : "Sign In"}</>}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {renderContent()}
    </div>
  );
};

export default ConnectProfile;

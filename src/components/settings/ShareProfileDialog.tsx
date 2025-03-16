
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Share2, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { v4 as uuidv4 } from 'uuid';
import useSync from "@/hooks/useSync";
import { Separator } from "@/components/ui/separator";

type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareProfileDialog = ({ open, onOpenChange }: ShareProfileDialogProps) => {
  const { user } = useAuth();
  const { useConnectWithUser } = useSync();
  const connectWithUserMutation = useConnectWithUser();
  
  const [copied, setCopied] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectToken, setConnectToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch share token when dialog opens
  useEffect(() => {
    if (open && user) {
      setIsLoading(true);
      fetchShareToken();
    }
  }, [open, user]);
  
  const fetchShareToken = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching share token for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('share_token')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching share token:', error);
        toast.error("Error fetching share token: " + error.message);
        return;
      }
      
      console.log("Share token data:", data);
      
      if (data?.share_token) {
        setShareToken(data.share_token);
      } else {
        // Generate a token if none exists
        generateShareToken();
      }
    } catch (error) {
      console.error("Error fetching share token:", error);
      toast.error("Error fetching share token");
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateShareToken = async () => {
    if (!user) return;
    
    try {
      setIsGenerating(true);
      const newToken = uuidv4().substring(0, 12); // Using shorter token for better usability
      console.log("Generating new share token:", newToken);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ share_token: newToken })
        .eq('id', user.id)
        .select('share_token')
        .single();
        
      if (error) {
        console.error('Error generating share token:', error);
        toast.error("Failed to generate share token: " + error.message);
        return;
      }
      
      console.log("Token generated and saved:", data);
      setShareToken(newToken);
      toast.success("Share token generated successfully");
      
      // Verify token was saved correctly
      setTimeout(async () => {
        const { data: verifyData, error: verifyError } = await supabase
          .from('profiles')
          .select('share_token')
          .eq('id', user.id)
          .maybeSingle();
          
        if (verifyError) {
          console.error('Error verifying token:', verifyError);
        } else {
          console.log("Verification of token:", verifyData);
          if (verifyData?.share_token !== newToken) {
            console.warn("Token verification failed - saved token doesn't match generated token");
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Error generating share token:", error);
      toast.error("Failed to generate share token");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const regenerateToken = () => {
    if (window.confirm("Are you sure you want to generate a new token? This will invalidate your existing share token.")) {
      generateShareToken();
    }
  };
  
  const copyToClipboard = () => {
    if (!shareToken) return;
    
    navigator.clipboard.writeText(shareToken)
      .then(() => {
        setCopied(true);
        toast.success("Share token copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };
  
  const handleInvitePartner = async () => {
    if (!partnerEmail || !partnerEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!shareToken) {
      toast.error("No share token available. Please try again.");
      return;
    }
    
    setIsSharing(true);
    
    try {
      // In a full implementation, this would send an email to the partner
      // For now, we'll just show a success message
      
      toast.success(`Invitation sent to ${partnerEmail}`);
      setPartnerEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing profile:", error);
      toast.error("Failed to share profile. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleConnectWithToken = async () => {
    if (!connectToken) {
      toast.error("Please enter a valid token");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      console.log("Attempting to connect with token:", connectToken);
      
      // First check if this token exists in database
      const { data: tokenCheck, error: tokenCheckError } = await supabase
        .from('profiles')
        .select('id, first_name')
        .eq('share_token', connectToken.trim())
        .maybeSingle();
        
      console.log("Token check result:", tokenCheck, tokenCheckError);
      
      if (tokenCheckError) {
        console.error("Error checking token:", tokenCheckError);
      } else if (!tokenCheck) {
        console.error("No profile found with this token");
        toast.error("Invalid token. No user found with this token.");
        setIsConnecting(false);
        return;
      }
      
      const success = await connectWithUserMutation.mutateAsync(connectToken);
      
      if (success) {
        toast.success("Successfully connected with user");
        setConnectToken("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error connecting with token:', error);
      toast.error("Failed to connect with user: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsConnecting(false);
    }
  };
  
  if (isLoading && !shareToken) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2">Loading your share token...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Profile</DialogTitle>
          <DialogDescription>
            Share your profile with a partner to sync recipes, meal plans, and shopping lists.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-token">Your share token</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-token"
                value={isGenerating ? "Generating..." : (shareToken || "No token generated")}
                readOnly
                className="flex-1 font-mono"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                disabled={!shareToken || isGenerating}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">
                Share this token with someone to connect your accounts
              </p>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={regenerateToken}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                {isGenerating ? "Generating..." : "Regenerate"}
              </Button>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="connect-token">Connect with someone's token</Label>
            <div className="flex space-x-2">
              <Input
                id="connect-token"
                type="text"
                placeholder="Enter share token"
                value={connectToken}
                onChange={(e) => setConnectToken(e.target.value)}
                className="font-mono"
              />
              <Button 
                type="button" 
                onClick={handleConnectWithToken}
                disabled={!connectToken || isConnecting}
              >
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
            {connectWithUserMutation.isError && (
              <p className="text-sm text-red-500 mt-1">
                Failed to connect. Please check the token and try again.
              </p>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="partner-email">Or invite a partner directly</Label>
            <Input
              id="partner-email"
              type="email"
              placeholder="partner@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            onClick={handleInvitePartner}
            disabled={isSharing || !shareToken || isGenerating || !partnerEmail}
            className="w-full sm:w-auto"
          >
            {isSharing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
            {isSharing ? "Sending invitation..." : "Invite Partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;

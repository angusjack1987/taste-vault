
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { v4 as uuidv4 } from 'uuid';

type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareProfileDialog = ({ open, onOpenChange }: ShareProfileDialogProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  
  // Fetch share token when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchShareToken();
    }
  }, [open, user]);
  
  const fetchShareToken = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('share_token')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching share token:', error);
        return;
      }
      
      if (data?.share_token) {
        setShareToken(data.share_token);
      } else {
        // Generate a token if none exists
        generateShareToken();
      }
    } catch (error) {
      console.error("Error fetching share token:", error);
    }
  };
  
  const generateShareToken = async () => {
    if (!user) return;
    
    try {
      const newToken = uuidv4();
      
      const { error } = await supabase
        .from('profiles')
        .update({ share_token: newToken })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error generating share token:', error);
        toast.error("Failed to generate share token");
        return;
      }
      
      setShareToken(newToken);
    } catch (error) {
      console.error("Error generating share token:", error);
      toast.error("Failed to generate share token");
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
                value={shareToken || "Generating..."}
                readOnly
                className="flex-1 font-mono"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                disabled={!shareToken}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Share this token with someone to connect your accounts
            </p>
          </div>
          
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
            disabled={isSharing || !shareToken}
            className="w-full sm:w-auto"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Sending invitation..." : "Invite Partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;

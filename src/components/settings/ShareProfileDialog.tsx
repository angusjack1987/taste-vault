
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareProfileDialog = ({ open, onOpenChange }: ShareProfileDialogProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  
  // Generate a share URL that includes the user's ID
  const shareUrl = `${window.location.origin}/connect-profile/${user?.id}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleInvitePartner = async () => {
    if (!partnerEmail || !partnerEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSharing(true);
    
    try {
      // Check if user exists with that email
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', partnerEmail)
        .maybeSingle();
        
      if (userError) {
        throw userError;
      }
      
      // Create a sharing relationship in the database
      const { error } = await supabase
        .from('profile_sharing')
        .insert({
          owner_id: user?.id,
          shared_with_email: partnerEmail,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Invitation sent!",
        description: `Profile sharing invitation sent to ${partnerEmail}`,
      });
      
      setPartnerEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing profile:", error);
      toast({
        title: "Error",
        description: "Failed to share profile. Please try again.",
        variant: "destructive",
      });
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
            <Label htmlFor="share-link">Share link</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
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
            disabled={isSharing}
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

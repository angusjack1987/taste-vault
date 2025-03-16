
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
  const shareUrl = user ? `${window.location.origin}/connect-profile/${user.id}` : '';
  
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
      // First check if an invitation already exists for this email
      const { data: existingInvitations } = await supabase
        .from('profile_sharing')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('shared_with_email', partnerEmail);
      
      if (existingInvitations && existingInvitations.length > 0) {
        toast({
          title: "Invitation already exists",
          description: `You've already sent an invitation to ${partnerEmail}`,
          variant: "destructive",
        });
        setIsSharing(false);
        return;
      }
      
      // Use a type assertion to avoid TypeScript inference issues
      const { error } = await supabase
        .from('profile_sharing')
        .insert([{
          owner_id: user?.id,
          shared_with_email: partnerEmail,
          status: 'pending'
        }] as any);
      
      if (error) throw error;
      
      // Currently there is no automated email sending directly from Supabase for this use case
      // We need to inform the user about this limitation
      toast({
        title: "Invitation recorded!",
        description: `Profile sharing invitation for ${partnerEmail} has been saved. Currently, you need to manually notify them with the share link.`,
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
            <p className="text-xs text-muted-foreground mt-1">
              Copy this link and share it directly with your partner
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
            <p className="text-xs text-muted-foreground mt-1">
              This will save their email to your invited list, but you'll need to share the link with them separately
            </p>
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

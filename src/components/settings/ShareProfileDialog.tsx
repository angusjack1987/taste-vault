
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";
import ShareLinkSection from "./share/ShareLinkSection";
import ShareButton from "./share/ShareButton";
import { useShareToken } from "@/hooks/useShareToken";
import { toast } from "@/hooks/use-toast";

type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareProfileDialog = ({ open, onOpenChange }: ShareProfileDialogProps) => {
  const { user } = useAuth();
  const [canShare, setCanShare] = useState(false);
  const { shareUrl, isRegenerating, generateShareToken } = useShareToken(user, open);
  
  // Check if Web Share API is available
  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);
  
  // Regenerate token if needed when dialog opens
  useEffect(() => {
    if (open && user && !shareUrl) {
      console.log("ShareProfileDialog: No share URL available, generating token");
      generateShareToken();
    }
  }, [open, user, shareUrl]);
  
  const handleCopyToClipboard = () => {
    const copyButton = document.getElementById("share-link-copy-btn");
    if (copyButton) {
      (copyButton as HTMLButtonElement).click();
      toast({
        title: "Share link copied",
        description: "Now send this link to someone you want to connect with."
      });
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
          <ShareLinkSection 
            shareUrl={shareUrl}
            isRegenerating={isRegenerating}
            onRegenerate={generateShareToken}
          />
        </div>
        
        <DialogFooter>
          <ShareButton 
            shareUrl={shareUrl}
            canShare={canShare}
            onCopyFallback={handleCopyToClipboard}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;

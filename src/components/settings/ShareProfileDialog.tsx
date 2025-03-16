
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, Share2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareProfileDialog = ({ open, onOpenChange }: ShareProfileDialogProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);
  
  // Generate a share URL that includes the user's ID and a token
  const shareUrl = user ? `${window.location.origin}/connect-profile/${user.id}${shareToken ? `?token=${shareToken}` : ''}` : '';
  
  // Check if Web Share API is available
  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);
  
  // Generate a new token when the dialog opens or when requested
  useEffect(() => {
    if (open && user) {
      generateShareToken();
    }
  }, [open, user]);
  
  const generateShareToken = async () => {
    if (!user) return;
    
    setIsRegenerating(true);
    
    try {
      // Generate a random token
      const newToken = Math.random().toString(36).substring(2, 15);
      
      // Save the token to the user's profile
      // Use type assertion with 'as any' to bypass the TypeScript type check
      const { error } = await supabase
        .from('profiles')
        .update({ 
          share_token: newToken // This field is now in the database
        } as any)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setShareToken(newToken);
      toast({
        title: "Share link updated",
        description: "Your sharing link has been regenerated successfully."
      });
    } catch (error) {
      console.error("Error generating share token:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new sharing link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard. You can now paste it to share with others.",
        });
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  const handleShare = async () => {
    if (!shareUrl) {
      toast({
        title: "Error",
        description: "No share URL available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (canShare) {
      try {
        await navigator.share({
          title: 'Connect with me on TasteVault',
          text: 'Join my TasteVault profile to sync recipes, meal plans, and shopping lists!',
          url: shareUrl,
        });
        
        toast({
          title: "Shared successfully",
          description: "Your profile link has been shared.",
        });
      } catch (error) {
        // User cancelled or share failed
        console.error('Error sharing:', error);
        
        // If sharing fails, fall back to copying to clipboard
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
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
            <div className="flex items-center justify-between">
              <Label htmlFor="share-link">Share link</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={generateShareToken}
                disabled={isRegenerating}
                className="flex items-center gap-1 text-xs h-7"
              >
                <RefreshCw className="h-3 w-3" />
                {isRegenerating ? 'Generating...' : 'Regenerate'}
              </Button>
            </div>
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
              Copy this link and share it directly with your partner. You can regenerate the link if you need a new one.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {canShare ? "Share Profile" : "Copy Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;

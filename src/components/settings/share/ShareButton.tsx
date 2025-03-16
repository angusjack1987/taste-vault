
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  shareUrl: string;
  canShare: boolean;
  onCopyFallback: () => void;
}

const ShareButton = ({ shareUrl, canShare, onCopyFallback }: ShareButtonProps) => {
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
        console.error('Error sharing:', error);
        
        // If sharing fails, fall back to copying to clipboard
        onCopyFallback();
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      onCopyFallback();
    }
  };
  
  return (
    <Button
      type="button"
      onClick={handleShare}
      className="w-full sm:w-auto"
    >
      <Share2 className="mr-2 h-4 w-4" />
      {canShare ? "Share Profile" : "Copy Link"}
    </Button>
  );
};

export default ShareButton;

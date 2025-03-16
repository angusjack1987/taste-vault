
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface ShareLinkSectionProps {
  shareUrl: string;
  isLoading: boolean;
}

const ShareLinkSection = ({ shareUrl, isLoading }: ShareLinkSectionProps) => {
  const [copied, setCopied] = useState(false);
  
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
  
  return (
    <div className="space-y-2">
      <Label htmlFor="share-link">Share link</Label>
      <div className="flex items-center space-x-2">
        <Input
          id="share-link"
          value={isLoading ? "Loading..." : shareUrl}
          readOnly
          className="flex-1"
        />
        <Button 
          id="share-link-copy-btn"
          type="button" 
          size="icon" 
          variant="outline" 
          onClick={copyToClipboard}
          className="flex-shrink-0"
          disabled={isLoading || !shareUrl}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Copy this link and share it directly with your partner.
      </p>
    </div>
  );
};

export default ShareLinkSection;

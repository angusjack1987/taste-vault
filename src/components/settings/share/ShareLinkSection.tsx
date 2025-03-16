
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, RefreshCw } from "lucide-react";

interface ShareLinkSectionProps {
  shareUrl: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

const ShareLinkSection = ({ shareUrl, isRegenerating, onRegenerate }: ShareLinkSectionProps) => {
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
      <div className="flex items-center justify-between">
        <Label htmlFor="share-link">Share link</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRegenerate}
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
          id="share-link-copy-btn"
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
  );
};

export default ShareLinkSection;

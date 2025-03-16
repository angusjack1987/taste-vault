
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Mail, 
  Twitter,
  Facebook,
  MessageCircle,
  Check 
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeName: string;
  onShare?: (method: string) => void;
}

const ShareRecipeDialog = ({
  open,
  onOpenChange,
  recipeName,
  onShare
}: ShareRecipeDialogProps) => {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  
  const handleShare = (method: string) => {
    if (method === 'copy') {
      navigator.clipboard.writeText(`Check out this recipe: ${recipeName}`)
        .then(() => {
          setCopied(true);
          toast.success("Link copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Error copying to clipboard:', err);
          toast.error("Failed to copy to clipboard");
        });
    } else {
      if (onShare) {
        onShare(method);
      } else {
        toast.success(`Shared recipe via ${method}`);
      }
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[90%]' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle>Share Recipe</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => handleShare('copy')}
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => handleShare('email')}
          >
            <Mail className="h-5 w-5" />
            <span className="text-sm">Email</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">WhatsApp</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-5 w-5" />
            <span className="text-sm">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2 col-span-2"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-5 w-5" />
            <span className="text-sm">Facebook</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRecipeDialog;

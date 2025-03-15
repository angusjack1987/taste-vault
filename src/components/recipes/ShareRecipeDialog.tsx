
import React from 'react';
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
  MessageCircle
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeName: string;
  onShare: (method: string) => void;
}

const ShareRecipeDialog = ({
  open,
  onOpenChange,
  recipeName,
  onShare
}: ShareRecipeDialogProps) => {
  const isMobile = useIsMobile();
  
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
            onClick={() => onShare('copy')}
          >
            <Copy className="h-5 w-5" />
            <span className="text-sm">Copy Link</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => onShare('email')}
          >
            <Mail className="h-5 w-5" />
            <span className="text-sm">Email</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => onShare('whatsapp')}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">WhatsApp</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2"
            onClick={() => onShare('twitter')}
          >
            <Twitter className="h-5 w-5" />
            <span className="text-sm">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20 gap-2 col-span-2"
            onClick={() => onShare('facebook')}
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

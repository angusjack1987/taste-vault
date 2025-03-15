
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
  Share2, 
  FileText,
  Twitter,
  Facebook,
  MessageCircle
} from 'lucide-react';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Recipe</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 gap-2"
            onClick={() => onShare('copy')}
          >
            <Copy className="h-6 w-6" />
            <span className="text-sm">Copy Link</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 gap-2"
            onClick={() => onShare('email')}
          >
            <Mail className="h-6 w-6" />
            <span className="text-sm">Email</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 gap-2"
            onClick={() => onShare('whatsapp')}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm">WhatsApp</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 gap-2"
            onClick={() => onShare('twitter')}
          >
            <Twitter className="h-6 w-6" />
            <span className="text-sm">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 gap-2"
            onClick={() => onShare('facebook')}
          >
            <Facebook className="h-6 w-6" />
            <span className="text-sm">Facebook</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRecipeDialog;

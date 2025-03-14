
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StickyNote } from 'lucide-react';
import { MealType } from '@/hooks/useMealPlans';

interface QuickAddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: Date | null;
  currentMealType: MealType | null;
  onSave: (note: string) => void;
}

const QuickAddMealDialog = ({ 
  open, 
  onOpenChange, 
  currentDay, 
  currentMealType, 
  onSave 
}: QuickAddMealDialogProps) => {
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim());
      setNote('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            <span>
              Quick Add for {currentMealType ? currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1) : ''} 
              {currentDay ? ` - ${format(currentDay, 'MMM d, yyyy')}` : ''}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="quick-note">Meal Note</Label>
            <Input
              id="quick-note"
              placeholder="e.g., Leftover pasta, Take-out pizza, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!note.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddMealDialog;

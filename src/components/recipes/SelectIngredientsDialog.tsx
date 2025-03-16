
import React, { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SelectIngredientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredients: string[];
  onConfirm: (selectedIngredients: string[]) => void;
  isLoading: boolean;
}

const SelectIngredientsDialog: React.FC<SelectIngredientsDialogProps> = ({
  open,
  onOpenChange,
  ingredients,
  onConfirm,
  isLoading,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(ingredients);

  const handleToggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) => {
      if (prev.includes(ingredient)) {
        return prev.filter((i) => i !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedIngredients);
  };

  const handleSelectAll = () => {
    setSelectedIngredients([...ingredients]);
  };

  const handleSelectNone = () => {
    setSelectedIngredients([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" scrollable maxHeight="70vh">
        <DialogHeader>
          <DialogTitle>Select Ingredients</DialogTitle>
          <DialogDescription>
            Choose which ingredients to add to your shopping list
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between mb-3 mt-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectNone}>
            Clear All
          </Button>
        </div>

        <ScrollArea className="max-h-[350px] pr-4">
          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                <Checkbox
                  id={`ingredient-${index}`}
                  checked={selectedIngredients.includes(ingredient)}
                  onCheckedChange={() => handleToggleIngredient(ingredient)}
                  className="border-2 border-black"
                />
                <Label htmlFor={`ingredient-${index}`} className="flex-1 cursor-pointer text-sm">
                  {ingredient}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4 flex space-x-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleConfirm} 
            className="flex-1"
            disabled={isLoading || selectedIngredients.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>Add to Shopping List</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectIngredientsDialog;

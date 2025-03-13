
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { MealType } from "@/hooks/useMealPlans";

interface SaveToMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMealType: MealType;
  onMealTypeChange: (type: MealType) => void;
  onSave: () => void;
}

const SaveToMealPlanDialog = ({
  open,
  onOpenChange,
  selectedMealType,
  onMealTypeChange,
  onSave
}: SaveToMealPlanDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Meal Plan</DialogTitle>
          <DialogDescription>
            Choose which meal to add this recipe to
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal Type</label>
            <div className="flex flex-col space-y-2">
              {["breakfast", "lunch", "dinner"].map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-secondary/10">
                  <input
                    type="radio"
                    value={type}
                    checked={selectedMealType === type}
                    onChange={() => onMealTypeChange(type as MealType)}
                    className="text-primary"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Add to Today's Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToMealPlanDialog;

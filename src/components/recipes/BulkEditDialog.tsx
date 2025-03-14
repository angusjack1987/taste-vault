
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import useRecipes from "@/hooks/useRecipes";

type BulkEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecipeIds: string[];
  onSuccess: () => void;
};

type FieldSelection = {
  tags: boolean;
  difficulty: boolean;
  time: boolean;
  servings: boolean;
};

const BulkEditDialog = ({ 
  open, 
  onOpenChange, 
  selectedRecipeIds, 
  onSuccess 
}: BulkEditDialogProps) => {
  const [fieldSelection, setFieldSelection] = useState<FieldSelection>({
    tags: false,
    difficulty: false,
    time: false,
    servings: false
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [time, setTime] = useState<string>("30");
  const [servings, setServings] = useState<string>("4");
  
  const { useBulkUpdateRecipes } = useRecipes();
  const { mutate: updateRecipes, isLoading } = useBulkUpdateRecipes();
  
  const handleToggleField = (field: keyof FieldSelection) => {
    setFieldSelection(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = () => {
    // Create update object only with selected fields
    const updates: Record<string, any> = {};
    
    if (fieldSelection.tags) {
      updates.tags = tags;
    }
    
    if (fieldSelection.difficulty) {
      updates.difficulty = difficulty;
    }
    
    if (fieldSelection.time) {
      updates.time = parseInt(time, 10) || null;
    }
    
    if (fieldSelection.servings) {
      updates.servings = parseInt(servings, 10) || null;
    }
    
    // Apply updates to all selected recipes
    const recipeUpdates = selectedRecipeIds.map(id => ({
      id,
      updates
    }));
    
    updateRecipes(recipeUpdates, {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
        resetForm();
      }
    });
  };
  
  const resetForm = () => {
    setFieldSelection({
      tags: false,
      difficulty: false,
      time: false,
      servings: false
    });
    setTags([]);
    setDifficulty("Medium");
    setTime("30");
    setServings("4");
  };
  
  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };
  
  const difficultyOptions = ["Easy", "Medium", "Hard"];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Edit {selectedRecipeIds.length} Recipes</DialogTitle>
          <DialogDescription>
            Choose which fields to update across all selected recipes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tags-toggle" className="text-sm">Tags</Label>
            <Switch 
              id="tags-toggle" 
              checked={fieldSelection.tags} 
              onCheckedChange={() => handleToggleField("tags")} 
            />
          </div>
          {fieldSelection.tags && (
            <div className="pl-3 border-l-2 border-primary/20">
              <TagInput
                placeholder="Add tags"
                tags={tags}
                setTags={setTags}
                className="w-full"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="difficulty-toggle" className="text-sm">Difficulty</Label>
            <Switch 
              id="difficulty-toggle" 
              checked={fieldSelection.difficulty} 
              onCheckedChange={() => handleToggleField("difficulty")} 
            />
          </div>
          {fieldSelection.difficulty && (
            <div className="pl-3 border-l-2 border-primary/20">
              <div className="flex gap-2">
                {difficultyOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={difficulty === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficulty(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="time-toggle" className="text-sm">Cooking Time (minutes)</Label>
            <Switch 
              id="time-toggle" 
              checked={fieldSelection.time} 
              onCheckedChange={() => handleToggleField("time")} 
            />
          </div>
          {fieldSelection.time && (
            <div className="pl-3 border-l-2 border-primary/20">
              <Input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                min="1"
                className="w-full"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="servings-toggle" className="text-sm">Servings</Label>
            <Switch 
              id="servings-toggle" 
              checked={fieldSelection.servings} 
              onCheckedChange={() => handleToggleField("servings")} 
            />
          </div>
          {fieldSelection.servings && (
            <div className="pl-3 border-l-2 border-primary/20">
              <Input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="1"
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              isLoading || 
              (!fieldSelection.tags && 
               !fieldSelection.difficulty && 
               !fieldSelection.time && 
               !fieldSelection.servings)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Recipes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditDialog;

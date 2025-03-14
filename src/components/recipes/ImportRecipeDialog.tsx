
import { useState } from "react";
import { X, Loader2, Link, Check, Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useScrapedRecipes from "@/hooks/useScrapedRecipes";
import { Label } from "@/components/ui/label";
import { RecipeFormData } from "@/hooks/useRecipes";
import { cleanIngredientString } from "@/lib/ingredient-parser";

interface ImportRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (recipeData: any) => void;
}

const ImportRecipeDialog = ({ open, onClose, onImport }: ImportRecipeDialogProps) => {
  const [url, setUrl] = useState("");
  const [scrapedRecipe, setScrapedRecipe] = useState<Partial<RecipeFormData> | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Partial<RecipeFormData> | null>(null);
  
  const { useScrapeRecipeMutation } = useScrapedRecipes();
  const { mutate: scrapeRecipe, isPending, isError, error } = useScrapeRecipeMutation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    scrapeRecipe(url, {
      onSuccess: (data) => {
        // Clean the ingredients when importing
        const cleanedIngredients = data.ingredients?.map(ingredient => 
          cleanIngredientString(ingredient)
        ) || [];
        
        const cleanedData = {
          ...data,
          ingredients: cleanedIngredients
        };
        
        setScrapedRecipe(cleanedData);
        setEditedRecipe(cleanedData);
      }
    });
  };
  
  const handleInputChange = (field: keyof RecipeFormData, value: any) => {
    if (!editedRecipe) return;
    setEditedRecipe({
      ...editedRecipe,
      [field]: value
    });
  };
  
  const handleArrayItemChange = (field: 'ingredients' | 'instructions' | 'tags', index: number, value: string) => {
    if (!editedRecipe) return;
    const array = [...(editedRecipe[field] || [])];
    array[index] = value;
    setEditedRecipe({
      ...editedRecipe,
      [field]: array
    });
  };
  
  const handleAddArrayItem = (field: 'ingredients' | 'instructions' | 'tags') => {
    if (!editedRecipe) return;
    setEditedRecipe({
      ...editedRecipe,
      [field]: [...(editedRecipe[field] || []), ""]
    });
  };
  
  const handleRemoveArrayItem = (field: 'ingredients' | 'instructions' | 'tags', index: number) => {
    if (!editedRecipe) return;
    const array = [...(editedRecipe[field] || [])];
    array.splice(index, 1);
    setEditedRecipe({
      ...editedRecipe,
      [field]: array
    });
  };
  
  const handleSaveRecipe = () => {
    if (editedRecipe) {
      onImport(editedRecipe);
      resetDialog();
    }
  };
  
  const resetDialog = () => {
    setScrapedRecipe(null);
    setEditedRecipe(null);
    setEditMode(false);
    setUrl("");
    onClose();
  };
  
  const renderUrlInputStep = () => (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center space-x-2 mt-2">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="url">Recipe URL</Label>
          <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
            <Link className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              id="url"
              placeholder="https://example.com/recipe"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border-0 focus-visible:ring-0"
              required
            />
          </div>
        </div>
      </div>
      
      {isError && (
        <div className="mt-2 text-sm text-destructive">
          {(error as Error)?.message || "Failed to import recipe. Please try again."}
        </div>
      )}
      
      <DialogFooter className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={resetDialog}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!url || isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            "Import Recipe"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
  
  const renderRecipePreview = () => {
    if (!scrapedRecipe || !editedRecipe) return null;
    
    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {editMode ? (
          // Edit mode
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Recipe Title</Label>
              <Input
                id="title"
                value={editedRecipe.title || ""}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Recipe Title"
              />
            </div>
            
            {editedRecipe.image && (
              <div className="space-y-2">
                <Label>Image</Label>
                <img 
                  src={editedRecipe.image} 
                  alt={editedRecipe.title || "Recipe"} 
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Cooking Time (min)</Label>
                <Input
                  id="time"
                  type="number"
                  min="1"
                  value={editedRecipe.time || ""}
                  onChange={(e) => handleInputChange('time', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={editedRecipe.servings || ""}
                  onChange={(e) => handleInputChange('servings', Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedRecipe.description || ""}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add a description for your recipe"
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Ingredients</Label>
              {(editedRecipe.ingredients || []).map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleArrayItemChange('ingredients', index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveArrayItem('ingredients', index)}
                    disabled={(editedRecipe.ingredients || []).length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddArrayItem('ingredients')}
              >
                Add Ingredient
              </Button>
            </div>
            
            <div className="space-y-3">
              <Label>Instructions</Label>
              {(editedRecipe.instructions || []).map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-2 flex-shrink-0">
                    <span className="flex items-center justify-center bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleArrayItemChange('instructions', index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveArrayItem('instructions', index)}
                    disabled={(editedRecipe.instructions || []).length <= 1}
                    className="mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddArrayItem('instructions')}
              >
                Add Step
              </Button>
            </div>
          </>
        ) : (
          // Preview mode
          <>
            <div>
              <h3 className="text-lg font-semibold">{editedRecipe.title}</h3>
              {editedRecipe.description && <p className="text-muted-foreground mt-1">{editedRecipe.description}</p>}
            </div>
            
            {editedRecipe.image && (
              <img 
                src={editedRecipe.image} 
                alt={editedRecipe.title || "Recipe"} 
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            
            <div className="flex gap-4 text-sm">
              {editedRecipe.time && <div>Time: {editedRecipe.time} mins</div>}
              {editedRecipe.servings && <div>Servings: {editedRecipe.servings}</div>}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Ingredients</h4>
              <ul className="list-disc pl-5 space-y-1">
                {(editedRecipe.ingredients || []).map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              <ol className="list-decimal pl-5 space-y-2">
                {(editedRecipe.instructions || []).map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </>
        )}
        
        <DialogFooter className="pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={resetDialog}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={editMode ? "outline" : "default"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Done Editing
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Recipe
              </>
            )}
          </Button>
          <Button 
            type="button"
            onClick={handleSaveRecipe}
            disabled={editMode}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Recipe
          </Button>
        </DialogFooter>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && resetDialog()}>
      <DialogContent className={scrapedRecipe ? "sm:max-w-3xl" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>
            {!scrapedRecipe ? "Import Recipe" : (editMode ? "Edit Recipe" : "Review Recipe")}
          </DialogTitle>
          <DialogDescription>
            {!scrapedRecipe 
              ? "Enter a URL to import a recipe from the web."
              : (editMode 
                  ? "Make changes to the recipe before saving." 
                  : "Review the recipe details before saving.")}
          </DialogDescription>
        </DialogHeader>
        
        {!scrapedRecipe ? renderUrlInputStep() : renderRecipePreview()}
      </DialogContent>
    </Dialog>
  );
};

export default ImportRecipeDialog;

import { useState } from "react";
import { X, Loader2, Link, Check, Save, Edit, Sparkles, UploadCloud } from "lucide-react";
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
import { cleanIngredientString, parsePreparation, parseIngredientAmount, extractPreparationInstructions } from "@/lib/ingredient-parser";
import IngredientInput from "./IngredientInput";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ImportRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (recipeData: any) => void;
}

const ImportRecipeDialog = ({ open, onClose, onImport }: ImportRecipeDialogProps) => {
  const [url, setUrl] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [scrapedRecipe, setScrapedRecipe] = useState<Partial<RecipeFormData> | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Partial<RecipeFormData> | null>(null);
  
  const { useScrapeRecipeMutation } = useScrapedRecipes();
  const { mutate: scrapeRecipe, isPending, isError, error } = useScrapeRecipeMutation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    scrapeRecipe(
      { url, useAI },
      {
        onSuccess: (data) => {
          console.log("Raw scraped ingredients:", data.ingredients);
          
          const cleanedIngredients = data.ingredients?.map(ingredient => {
            const cleaned = cleanIngredientString(ingredient);
            console.log(`Cleaned ingredient: "${ingredient}" -> "${cleaned}"`);
            return cleaned;
          }) || [];
          
          const cleanedData = {
            ...data,
            ingredients: cleanedIngredients
          };
          
          setScrapedRecipe(cleanedData);
          setEditedRecipe(cleanedData);
        }
      }
    );
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
  
  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddArrayItem('ingredients');
    }
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
    setUseAI(false);
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
      
      <div className="flex items-center space-x-2 mt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-ai"
            checked={useAI}
            onCheckedChange={setUseAI}
          />
          <Label htmlFor="use-ai" className="cursor-pointer">
            {useAI ? (
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-sage-500" />
                Use AI to extract recipe (better for complex websites)
              </span>
            ) : (
              "Use web scraper (faster, works for most recipe sites)"
            )}
          </Label>
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
              {useAI ? "Analyzing with AI..." : "Importing..."}
            </>
          ) : (
            useAI ? "Extract with AI" : "Import Recipe"
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
            
            <div className="space-y-2">
              <Label>Image</Label>
              {editedRecipe.image ? (
                <div className="relative">
                  <img 
                    src={editedRecipe.image} 
                    alt={editedRecipe.title || "Recipe"} 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleInputChange('image', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="w-full h-48 border-2 border-dashed rounded-md flex flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => {
                    toast.info("You can upload an image after saving the recipe");
                  }}
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
            
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
              <IngredientInput 
                ingredients={editedRecipe.ingredients || []}
                onChange={(ingredients) => handleInputChange('ingredients', ingredients)}
                onAdd={() => handleAddArrayItem('ingredients')}
                onRemove={(index) => handleRemoveArrayItem('ingredients', index)}
                onKeyDown={handleIngredientKeyDown}
              />
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
          <>
            <div>
              <h3 className="text-lg font-semibold">{editedRecipe.title}</h3>
              {editedRecipe.description && <p className="text-muted-foreground mt-1">{editedRecipe.description}</p>}
            </div>
            
            {editedRecipe.image ? (
              <img 
                src={editedRecipe.image} 
                alt={editedRecipe.title || "Recipe"} 
                className="w-full h-48 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
            
            <div className="flex gap-4 text-sm">
              {editedRecipe.time && <div>Time: {editedRecipe.time} mins</div>}
              {editedRecipe.servings && <div>Servings: {editedRecipe.servings}</div>}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Ingredients</h4>
              <ul className="list-disc pl-5 space-y-1">
                {(editedRecipe.ingredients || []).map((ingredient, index) => {
                  console.log(`Processing ingredient for display: "${ingredient}"`);
                  
                  const preparationInstructions = extractPreparationInstructions(ingredient);
                  
                  const { mainText, preparation } = parsePreparation(ingredient);
                  const { name, amount } = parseIngredientAmount(mainText);
                  
                  console.log(`Parsed into: amount="${amount}", name="${name}", prep="${preparationInstructions || preparation}"`);
                  
                  return (
                    <li key={index} className="text-sm">
                      {amount && <span className="font-medium">{amount} </span>}
                      <span>{name}</span>
                      {(preparationInstructions || preparation) && (
                        <span className="text-muted-foreground italic ml-1">
                          {`, ${preparationInstructions || preparation}`}
                        </span>
                      )}
                    </li>
                  );
                })}
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


import { useState } from "react";
import { X, Loader2, Link, Check, Save, Edit, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
import { toast } from "sonner";

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
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { useScrapeRecipeMutation } = useScrapedRecipes();
  const { mutate: scrapeRecipe, isPending, isError, error } = useScrapeRecipeMutation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    scrapeRecipe(
      url,
      {
        onSuccess: (data) => {
          console.log("Raw scraped data:", data);
          
          // Enhanced cleaning of ingredients with better preservation of prep instructions
          const cleanedIngredients = data.ingredients?.map(ingredient => {
            const cleaned = cleanIngredientString(ingredient);
            console.log(`Cleaned ingredient: "${ingredient}" -> "${cleaned}"`);
            return cleaned;
          }) || [];
          
          // Handle multiple images
          const imagesList = Array.isArray(data.images) ? data.images : 
                            (data.image ? [data.image] : []);
          
          setImages(imagesList);
          setSelectedImageIndex(imagesList.length > 0 ? 0 : -1);
          
          const cleanedData = {
            ...data,
            ingredients: cleanedIngredients,
            // Set the first image as the default if available
            image: imagesList.length > 0 ? imagesList[0] : null
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
      // Ensure the selected image is saved with the recipe
      if (images.length > 0 && selectedImageIndex >= 0 && selectedImageIndex < images.length) {
        editedRecipe.image = images[selectedImageIndex];
      }
      
      onImport(editedRecipe);
      resetDialog();
    }
  };
  
  const resetDialog = () => {
    setScrapedRecipe(null);
    setEditedRecipe(null);
    setEditMode(false);
    setUrl("");
    setImages([]);
    setSelectedImageIndex(0);
    onClose();
  };
  
  const selectNextImage = () => {
    if (images.length > 1) {
      const nextIndex = (selectedImageIndex + 1) % images.length;
      setSelectedImageIndex(nextIndex);
      if (editedRecipe) {
        setEditedRecipe({
          ...editedRecipe,
          image: images[nextIndex]
        });
      }
    }
  };
  
  const selectPrevImage = () => {
    if (images.length > 1) {
      const prevIndex = (selectedImageIndex - 1 + images.length) % images.length;
      setSelectedImageIndex(prevIndex);
      if (editedRecipe) {
        setEditedRecipe({
          ...editedRecipe,
          image: images[prevIndex]
        });
      }
    }
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
          <span className="flex items-center text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 mr-1 text-sage-500" />
            Using AI to extract recipe (optimized for all websites)
          </span>
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
              Analyzing with AI...
            </>
          ) : (
            "Extract Recipe"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
  
  const renderImageCarousel = () => {
    if (!images.length) return null;
    
    return (
      <div className="space-y-2">
        <Label>Recipe Image {images.length > 1 ? `(${selectedImageIndex + 1}/${images.length})` : ''}</Label>
        <div className="relative">
          <div className="w-full h-48 overflow-hidden rounded-md relative">
            <img 
              src={images[selectedImageIndex]} 
              alt="Recipe" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Handle image loading error
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg'; // Fall back to placeholder
                target.onerror = null; // Prevent infinite error loop
              }}
            />
          </div>
          
          {images.length > 1 && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 border-none hover:bg-background"
                onClick={selectPrevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 border-none hover:bg-background"
                onClick={selectNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center mt-2 space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === selectedImageIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => {
                  setSelectedImageIndex(index);
                  if (editedRecipe) {
                    setEditedRecipe({
                      ...editedRecipe,
                      image: images[index]
                    });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
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
            
            {renderImageCarousel()}
            
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
            
            {renderImageCarousel()}
            
            <div className="flex gap-4 text-sm">
              {editedRecipe.time && <div>Time: {editedRecipe.time} mins</div>}
              {editedRecipe.servings && <div>Servings: {editedRecipe.servings}</div>}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Ingredients</h4>
              <ul className="list-disc pl-5 space-y-1">
                {(editedRecipe.ingredients || []).map((ingredient, index) => {
                  console.log(`Processing ingredient for display: "${ingredient}"`);
                  
                  // First try to extract direct preparation instructions
                  const preparationInstructions = extractPreparationInstructions(ingredient);
                  
                  // If that doesn't work, fall back to the standard parsing approach
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

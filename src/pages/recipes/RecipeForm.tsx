import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Plus, Minus, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import useRecipes, { RecipeFormData } from "@/hooks/useRecipes";
import IngredientInput from "@/components/recipes/IngredientInput";
import { supabase } from "@/integrations/supabase/client";

const RecipeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  
  const { useRecipe, useCreateRecipe, useUpdateRecipe } = useRecipes();
  const { data: existingRecipe, isLoading: isLoadingRecipe } = useRecipe(id);
  const { mutate: createRecipe, isPending: isCreating } = useCreateRecipe();
  const { mutate: updateRecipe, isPending: isUpdating } = useUpdateRecipe();
  
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    image: "",
    images: [],
    time: 30,
    servings: 2,
    difficulty: "Easy",
    description: "",
    ingredients: [""],
    instructions: [""],
    tags: []
  });
  
  const [newTag, setNewTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = isCreating || isUpdating;
  
  useEffect(() => {
    const extractedData = location.state?.recipeData;
    if (extractedData && !isEditing) {
      setFormData({
        ...formData,
        ...extractedData,
        ingredients: extractedData.ingredients?.length > 0 
          ? extractedData.ingredients 
          : [""],
        instructions: extractedData.instructions?.length > 0 
          ? extractedData.instructions 
          : [""]
      });
      
      window.history.replaceState({}, document.title);
      
      toast({
        title: "Recipe extracted from image",
        description: "Review and edit the details before saving.",
      });
    }
  }, [location.state]);
  
  useEffect(() => {
    if (isEditing && existingRecipe) {
      setFormData({
        title: existingRecipe.title,
        image: existingRecipe.image || "",
        images: existingRecipe.images || [],
        time: existingRecipe.time || 30,
        servings: existingRecipe.servings || 2,
        difficulty: existingRecipe.difficulty || "Easy",
        description: existingRecipe.description || "",
        ingredients: existingRecipe.ingredients.length > 0 ? existingRecipe.ingredients : [""],
        instructions: existingRecipe.instructions.length > 0 ? existingRecipe.instructions : [""],
        tags: existingRecipe.tags
      });
    }
  }, [isEditing, existingRecipe]);
  
  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ""]
    });
  };
  
  const handleAddInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ""]
    });
  };
  
  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };
  
  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...formData.instructions];
    newInstructions.splice(index, 1);
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };
  
  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (formData.ingredients[index].trim()) {
        handleAddIngredient();
        
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[placeholder^="Ingredient"]');
          const newInput = inputs[inputs.length - 1] as HTMLInputElement;
          if (newInput) newInput.focus();
        }, 10);
      }
    }
  };
  
  const handleInstructionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Enter' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
      e.preventDefault();
      handleAddInstruction();
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea[placeholder^="Step"]');
        const newTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
        if (newTextarea) newTextarea.focus();
      }, 10);
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${Date.now()}-${randomId}.${fileExt}`;
      const filePath = `recipe-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recipes')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('recipes').getPublicUrl(filePath);
      
      setFormData({
        ...formData,
        image: data.publicUrl,
        images: [...(formData.images || []), data.publicUrl]
      });
      
      toast({
        title: "Image uploaded",
        description: "Your recipe image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.trim() !== ""),
      instructions: formData.instructions.filter(i => i.trim() !== "")
    };
    
    if (isEditing && id) {
      updateRecipe(
        { id, ...cleanedData },
        {
          onSuccess: () => {
            navigate(`/recipes/${id}`);
          }
        }
      );
    } else {
      createRecipe(
        cleanedData, 
        {
          onSuccess: (data) => {
            navigate(`/recipes/${data.id}`);
          }
        }
      );
    }
  };
  
  if (isEditing && isLoadingRecipe) {
    return (
      <MainLayout title="Loading Recipe" showBackButton={true}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title={isEditing ? "Edit Recipe" : "New Recipe"} 
      showBackButton={true}
    >
      <div className="page-container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title">Recipe Title</Label>
            <Input
              id="title"
              placeholder="Enter recipe title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label>Recipe Image</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleImageClick}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                </div>
              ) : formData.image ? (
                <div className="space-y-2">
                  <img 
                    src={formData.image} 
                    alt="Recipe preview" 
                    className="max-h-32 mx-auto object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({...formData, image: ""});
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload an image for your recipe
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Choose Image
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Cooking Time (min)</Label>
              <Input
                id="time"
                type="number"
                min="1"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData({...formData, servings: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your recipe"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Ingredients</Label>
            <IngredientInput 
              ingredients={formData.ingredients}
              onChange={(ingredients) => setFormData({...formData, ingredients})}
              onAdd={handleAddIngredient}
              onRemove={handleRemoveIngredient}
              onKeyDown={handleIngredientKeyDown}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Instructions</Label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 mt-2">
                  <span className="flex items-center justify-center bg-sage-500 text-white w-6 h-6 rounded-full text-sm">
                    {index + 1}
                  </span>
                </div>
                <Textarea
                  placeholder={`Step ${index + 1}`}
                  value={instruction}
                  onChange={(e) => {
                    const newInstructions = [...formData.instructions];
                    newInstructions[index] = e.target.value;
                    setFormData({...formData, instructions: newInstructions});
                  }}
                  onKeyDown={(e) => handleInstructionKeyDown(e, index)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveInstruction(index)}
                  disabled={formData.instructions.length <= 1}
                  className="mt-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddInstruction}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
          
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., Vegetarian, Italian)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-sage-700 hover:text-sage-900"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Recipe" : "Create Recipe"
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default RecipeForm;


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Minus, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import useRecipes, { RecipeFormData } from "@/hooks/useRecipes";

const RecipeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;
  
  const { useRecipe, useCreateRecipe, useUpdateRecipe } = useRecipes();
  const { data: existingRecipe, isLoading: isLoadingRecipe } = useRecipe(id);
  const { mutate: createRecipe, isPending: isCreating } = useCreateRecipe();
  const { mutate: updateRecipe, isPending: isUpdating } = useUpdateRecipe();
  
  // Initialize form with empty values or existing recipe data if editing
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    image: "",
    time: 30,
    servings: 2,
    difficulty: "Easy",
    description: "",
    ingredients: [""],
    instructions: [""],
    tags: []
  });
  
  const [newTag, setNewTag] = useState("");
  const isSubmitting = isCreating || isUpdating;
  
  // Load existing recipe data when editing
  useEffect(() => {
    if (isEditing && existingRecipe) {
      setFormData({
        title: existingRecipe.title,
        image: existingRecipe.image || "",
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty ingredients and instructions
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
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {formData.image ? (
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
                    onClick={() => setFormData({...formData, image: ""})}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop an image or click to upload
                  </p>
                  <Button type="button" variant="outline" size="sm">
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
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) => {
                    const newIngredients = [...formData.ingredients];
                    newIngredients[index] = e.target.value;
                    setFormData({...formData, ingredients: newIngredients});
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={formData.ingredients.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
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
            <Button type="submit" disabled={isSubmitting}>
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

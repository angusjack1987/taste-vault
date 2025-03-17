
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRecipes } from '@/hooks/useRecipes';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IngredientInput from '@/components/recipes/IngredientInput';
import useAuth from '@/hooks/useAuth';
import RecipePhotoCapture from '@/components/recipes/RecipePhotoCapture';
import { Loader2 } from 'lucide-react';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  time: z.number().min(1).optional(),
  servings: z.number().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  nutrients: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional()
  }).optional()
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useRecipe, useCreateRecipe, useUpdateRecipe } = useRecipes();
  const { data: existingRecipe, isLoading: isLoadingRecipe } = useRecipe(id);
  const { mutateAsync: createRecipe, isPending: isCreating } = useCreateRecipe();
  const { mutateAsync: updateRecipe, isPending: isUpdating } = useUpdateRecipe();
  
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [formStep, setFormStep] = useState(1);
  const [isOwner, setIsOwner] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      time: undefined,
      servings: undefined,
      difficulty: 'medium',
      tags: [],
      notes: '',
      ingredients: [],
      instructions: [],
      image: '',
      images: [],
      nutrients: {
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined
      }
    }
  });

  useEffect(() => {
    if (existingRecipe && user) {
      setIsOwner(existingRecipe.user_id === user.id);
      
      // Populate the form with existing recipe data
      form.reset({
        title: existingRecipe.title,
        description: existingRecipe.description || '',
        time: existingRecipe.time,
        servings: existingRecipe.servings,
        difficulty: existingRecipe.difficulty || 'medium',
        tags: existingRecipe.tags || [],
        notes: existingRecipe.notes || '',
        ingredients: existingRecipe.ingredients || [],
        instructions: existingRecipe.instructions || [],
        image: existingRecipe.image || '',
        images: existingRecipe.images || [],
        nutrients: existingRecipe.nutrients || {
          calories: undefined,
          protein: undefined,
          carbs: undefined,
          fat: undefined
        }
      });
      
      setIngredients(existingRecipe.ingredients || []);
      setInstructions(existingRecipe.instructions || []);
    }
  }, [existingRecipe, form, user]);

  const onSubmit = async (data: RecipeFormValues) => {
    try {
      // Make sure ingredients and instructions are included
      data.ingredients = ingredients;
      data.instructions = instructions;
      
      if (id && existingRecipe) {
        if (!isOwner) {
          toast.error("You don't have permission to edit this recipe");
          return;
        }
        
        await updateRecipe({
          id,
          ...data
        });
        toast.success("Recipe updated successfully");
      } else {
        await createRecipe(data);
        toast.success("Recipe created successfully");
      }
      navigate('/recipes');
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe");
    }
  };

  const handleAddIngredient = (ingredient: string) => {
    if (!ingredient.trim()) return;
    setIngredients([...ingredients, ingredient]);
    form.setValue('ingredients', [...ingredients, ingredient]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
    form.setValue('ingredients', newIngredients);
  };

  const handleAddInstruction = (instruction: string) => {
    if (!instruction.trim()) return;
    setInstructions([...instructions, instruction]);
    form.setValue('instructions', [...instructions, instruction]);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
    form.setValue('instructions', newInstructions);
  };

  const handleNextStep = () => {
    setFormStep(2);
  };

  const handlePreviousStep = () => {
    setFormStep(1);
  };

  const handlePhotoCapture = (imageUrl: string) => {
    form.setValue('image', imageUrl);
  };

  if (isLoadingRecipe && id) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (id && existingRecipe && !isOwner) {
    return (
      <div className="container py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Permission Denied</h1>
          <p>You don't have permission to edit this recipe.</p>
          <Button onClick={() => navigate('/recipes')}>Back to Recipes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 pb-20">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Recipe' : 'Create New Recipe'}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formStep === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipe title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your recipe" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooking Time (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min={1}
                          placeholder="4" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Image</FormLabel>
                    <FormControl>
                      <RecipePhotoCapture 
                        currentImage={field.value} 
                        onCapture={handlePhotoCapture}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="button" onClick={handleNextStep}>
                  Next: Ingredients & Instructions
                </Button>
              </div>
            </div>
          )}
          
          {formStep === 2 && (
            <div className="space-y-6">
              <div>
                <FormLabel>Ingredients</FormLabel>
                <IngredientInput
                  ingredients={ingredients}
                  onAddIngredient={handleAddIngredient}
                  onRemoveIngredient={handleRemoveIngredient}
                />
                {form.formState.errors.ingredients && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.ingredients.message}
                  </p>
                )}
              </div>
              
              <div>
                <FormLabel>Instructions</FormLabel>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a step"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInstruction((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleAddInstruction(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <ol className="space-y-2 list-decimal list-inside">
                    {instructions.map((instruction, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="flex-1">{instruction}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInstruction(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ol>
                  
                  {form.formState.errors.instructions && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.instructions.message}
                    </p>
                  )}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes or tips" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousStep}>
                  Back to Details
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                    null}
                  {id ? 'Update Recipe' : 'Create Recipe'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default RecipeForm;

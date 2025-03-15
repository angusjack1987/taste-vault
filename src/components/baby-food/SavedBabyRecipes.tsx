
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Clock, Baby, Search, ChefHat, Utensils } from 'lucide-react';
import { toast } from 'sonner';

interface BabyFoodRecipe {
  id: string;
  title: string;
  description: string;
  age_range: string;
  ingredients: string[];
  instructions: string[];
  preparation_time: number;
  storage_tips: string;
  nutritional_benefits: string[];
  created_at: string;
}

const SavedBabyRecipes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['baby-food-recipes'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('baby_food_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as BabyFoodRecipe[];
    },
    enabled: !!user
  });

  const deleteMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const { error } = await supabase
        .from('baby_food_recipes')
        .delete()
        .eq('id', recipeId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baby-food-recipes'] });
      toast.success('Recipe deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    }
  });

  const filteredRecipes = recipes?.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.age_range?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading saved recipes...</p>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <AccordionItem 
              key={recipe.id} 
              value={recipe.id}
              className="border-2 border-black rounded-xl bg-white overflow-hidden transition-all duration-300 hover:bg-[#f4f4f0]"
            >
              <AccordionTrigger className="px-6 py-4 text-left">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <span className="font-bold">{recipe.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {recipe.age_range}
                    </Badge>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>{recipe.preparation_time} mins</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="space-y-4">
                  <p className="text-sm">{recipe.description}</p>
                  
                  <div>
                    <h4 className="font-bold mb-2">Ingredients:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-sm">{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Instructions:</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      {recipe.instructions.map((step, idx) => (
                        <li key={idx} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  {recipe.nutritional_benefits && recipe.nutritional_benefits.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-2">Nutritional Benefits:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {recipe.nutritional_benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recipe.storage_tips && (
                    <div>
                      <h4 className="font-bold mb-2">Storage Tips:</h4>
                      <p className="text-sm">{recipe.storage_tips}</p>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="mt-4">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Recipe
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this recipe? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(recipe.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">No saved recipes yet</h3>
          <p className="text-muted-foreground mb-4">
            Generate and save baby food recipes to see them here
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedBabyRecipes;

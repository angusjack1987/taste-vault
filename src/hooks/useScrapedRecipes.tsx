
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecipeFormData } from "./useRecipes";

export const useScrapedRecipes = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to scrape recipe using OpenAI
  const scrapeRecipeWithAI = async (url: string): Promise<Partial<RecipeFormData>> => {
    setIsLoading(true);
    
    try {
      // Call scrape-recipe edge function
      const { data, error } = await supabase.functions.invoke("scrape-recipe", {
        body: { url }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process the scraped recipe data
      console.log("Scraped recipe data:", data);
      
      // Extract multiple images if available
      const extractedImages = Array.isArray(data.images) ? data.images : 
                             (data.image ? [data.image] : []);
      
      // Format the data for the form
      const recipeData: Partial<RecipeFormData> = {
        title: data.title || "Untitled Recipe",
        image: extractedImages.length > 0 ? extractedImages[0] : null,
        images: extractedImages,
        time: data.time || 30,
        servings: data.servings || 2,
        difficulty: data.difficulty || "Medium",
        description: data.description || "",
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || []
      };
      
      toast.success("Recipe extracted successfully");
      return recipeData;
    } catch (error) {
      console.error("Error scraping recipe:", error);
      toast.error(`Failed to scrape recipe: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified scrape function that only uses the AI parser
  const scrapeRecipe = async (url: string): Promise<Partial<RecipeFormData>> => {
    return scrapeRecipeWithAI(url);
  };

  const useScrapeRecipeMutation = () => {
    return useMutation({
      mutationFn: scrapeRecipe
    });
  };

  return {
    isLoading,
    useScrapeRecipeMutation
  };
};

export default useScrapedRecipes;

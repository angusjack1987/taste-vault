
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecipeFormData } from "./useRecipes";

export const useScrapedRecipes = () => {
  const [isLoading, setIsLoading] = useState(false);

  const scrapeRecipe = async (url: string): Promise<Partial<RecipeFormData>> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("scrape-recipe", {
        body: { url }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to scrape recipe");
      }
      
      // Process the scraped recipe data
      const scrapedRecipe = data.data;
      
      // Download and upload the image if it exists
      let imageUrl = null;
      if (scrapedRecipe.image) {
        try {
          // Fetch the image
          const imgResponse = await fetch(scrapedRecipe.image);
          if (!imgResponse.ok) throw new Error("Failed to fetch image");
          
          const blob = await imgResponse.blob();
          
          // Generate a unique file name
          const fileExt = scrapedRecipe.image.split('.').pop()?.split('?')[0] || 'jpg';
          const randomId = Math.random().toString(36).substring(2, 15);
          const fileName = `scraped-${Date.now()}-${randomId}.${fileExt}`;
          const filePath = `recipe-images/${fileName}`;
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recipes')
            .upload(filePath, blob, {
              contentType: blob.type,
              cacheControl: '3600'
            });
          
          if (uploadError) throw uploadError;
          
          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('recipes')
            .getPublicUrl(filePath);
          
          imageUrl = publicUrlData.publicUrl;
        } catch (imgError) {
          console.error("Error uploading image:", imgError);
          // Continue without image if there's an error
        }
      }
      
      // Clean the data and format it for the form
      const recipeData: Partial<RecipeFormData> = {
        title: scrapedRecipe.title || "Untitled Recipe",
        image: imageUrl,
        time: scrapedRecipe.time || 30,
        servings: 2, // Default
        difficulty: "Medium", // Default
        description: "", // Can be added by user
        ingredients: scrapedRecipe.ingredients || [],
        instructions: scrapedRecipe.instructions || [],
        tags: scrapedRecipe.tags || []
      };
      
      toast.success("Recipe scraped successfully");
      return recipeData;
    } catch (error) {
      console.error("Error scraping recipe:", error);
      toast.error(`Failed to scrape recipe: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
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

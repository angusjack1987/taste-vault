
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
      // Call the AI recipe parser edge function
      const { data, error } = await supabase.functions.invoke("ai-recipe-parser", {
        body: { url }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to parse recipe with AI");
      }
      
      // Process the AI-parsed recipe data
      const parsedRecipe = data.data;
      
      // Download and upload the image if it exists (same process as the web scraper)
      let imageUrl = null;
      if (parsedRecipe.image) {
        try {
          console.log("Attempting to download image from:", parsedRecipe.image);
          
          // Fetch the image
          const imgResponse = await fetch(parsedRecipe.image);
          if (!imgResponse.ok) {
            console.error("Failed to fetch image:", imgResponse.status, imgResponse.statusText);
            throw new Error("Failed to fetch image");
          }
          
          const blob = await imgResponse.blob();
          console.log("Image downloaded successfully, size:", blob.size, "type:", blob.type);
          
          // Generate a unique file name
          const fileExt = parsedRecipe.image.split('.').pop()?.split('?')[0] || 'jpg';
          const randomId = Math.random().toString(36).substring(2, 15);
          const fileName = `ai-scraped-${Date.now()}-${randomId}.${fileExt}`;
          const filePath = `recipe-images/${fileName}`;
          
          console.log("Uploading image to storage path:", filePath);
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recipes')
            .upload(filePath, blob, {
              contentType: blob.type,
              cacheControl: '3600'
            });
          
          if (uploadError) {
            console.error("Error uploading to storage:", uploadError);
            throw uploadError;
          }
          
          console.log("Image uploaded successfully:", uploadData);
          
          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('recipes')
            .getPublicUrl(filePath);
          
          imageUrl = publicUrlData.publicUrl;
          console.log("Image public URL:", imageUrl);
        } catch (imgError) {
          console.error("Error uploading image:", imgError);
          // Continue without image if there's an error
        }
      }
      
      // Format the data for the form
      const recipeData: Partial<RecipeFormData> = {
        title: parsedRecipe.title || "Untitled Recipe",
        image: imageUrl,
        time: parsedRecipe.time || 30,
        servings: parsedRecipe.servings || 2,
        difficulty: parsedRecipe.difficulty || "Medium",
        description: parsedRecipe.description || "",
        ingredients: parsedRecipe.ingredients || [],
        instructions: parsedRecipe.instructions || [],
        tags: parsedRecipe.tags || []
      };
      
      toast.success("Recipe extracted with AI successfully");
      return recipeData;
    } catch (error) {
      console.error("Error parsing recipe with AI:", error);
      toast.error(`Failed to parse recipe with AI: ${error.message}`);
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


import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecipeFormData } from "./useRecipes";

export const useScrapedRecipes = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to download and upload an image URL to Supabase storage
  const downloadAndUploadImage = async (imageUrl: string | null): Promise<string | null> => {
    if (!imageUrl) return null;
    
    try {
      console.log("Attempting to download image from:", imageUrl);
      
      // Fetch the image
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) {
        console.error("Failed to fetch image:", imgResponse.status, imgResponse.statusText);
        throw new Error("Failed to fetch image");
      }
      
      const blob = await imgResponse.blob();
      console.log("Image downloaded successfully, size:", blob.size, "type:", blob.type);
      
      // Only proceed if we actually got an image
      if (blob.size < 1000) {
        console.warn("Image is too small, may be a tracking pixel. Skipping upload.");
        return null;
      }
      
      // Generate a unique file name
      const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `scraped-${Date.now()}-${randomId}.${fileExt}`;
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
      
      const finalImageUrl = publicUrlData.publicUrl;
      console.log("Image public URL:", finalImageUrl);
      return finalImageUrl;
      
    } catch (imgError) {
      console.error("Error processing image:", imgError);
      // Continue without image if there's an error
      return null;
    }
  };

  // Function to scrape recipe using direct web scraper
  const scrapeRecipeWithWebScraper = async (url: string): Promise<Partial<RecipeFormData>> => {
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
        imageUrl = await downloadAndUploadImage(scrapedRecipe.image);
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
      
      // Download and upload the image if it exists
      let imageUrl = null;
      if (parsedRecipe.image) {
        imageUrl = await downloadAndUploadImage(parsedRecipe.image);
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

  // General scrape function that delegates to the appropriate scraper based on useAI flag
  const scrapeRecipe = async (params: { url: string; useAI: boolean }): Promise<Partial<RecipeFormData>> => {
    const { url, useAI } = params;
    
    if (useAI) {
      return scrapeRecipeWithAI(url);
    } else {
      return scrapeRecipeWithWebScraper(url);
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

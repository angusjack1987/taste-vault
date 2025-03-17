
import { useState, useRef } from "react";
import { Camera, Image, Loader2, X, Check, Star, Clock, Users, BookmarkPlus, Pencil, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { RecipeFormData } from "@/hooks/recipes/types";

interface RecipePhotoCaptureProps {
  open: boolean;
  onClose: () => void;
  onRecipeExtracted: (recipe: Partial<RecipeFormData>) => void;
}

const RecipePhotoCapture = ({ open, onClose, onRecipeExtracted }: RecipePhotoCaptureProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedRecipe, setExtractedRecipe] = useState<Partial<RecipeFormData> | null>(null);
  const [noTextDetected, setNoTextDetected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setExtractedRecipe(null);
      setNoTextDetected(false);
    };
    reader.readAsDataURL(file);
  };
  
  const startCamera = async () => {
    try {
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
      setIsCapturing(false);
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      setExtractedRecipe(null);
      setNoTextDetected(false);
    }
    
    stopCamera();
  };
  
  const processImage = async () => {
    if (!imagePreview) return;
    
    setIsProcessing(true);
    setNoTextDetected(false);
    
    try {
      if (!navigator.onLine) {
        throw new Error("You appear to be offline. Please check your internet connection and try again.");
      }
      
      // Convert data URL to base64
      const base64Data = imagePreview.split(',')[1];
      
      console.log("Calling extract-recipe-from-image edge function");
      
      // Call the edge function with a timeout
      const functionPromise = supabase.functions.invoke("extract-recipe-from-image", {
        body: { imageBase64: base64Data }
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out. The image may be too large or the server is busy.")), 30000);
      });
      
      // Race the function call against the timeout
      const { data, error } = await Promise.race([
        functionPromise,
        timeoutPromise.then(() => {
          throw new Error("Request timed out");
        })
      ]) as { data: any, error: any };
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Error processing image: ${error.message}`);
      }
      
      // Ensure the data is not null or undefined
      if (!data) {
        throw new Error("Received empty data from image processing");
      }
      
      // Debug what we received
      console.log("Extracted recipe data:", data);
      
      // Check if no text was detected
      if (data.noTextDetected) {
        setNoTextDetected(true);
        toast.error("No recipe text detected in this image");
        return;
      }
      
      // Format the data for the form and include the image
      const recipeData: Partial<RecipeFormData> = {
        title: data.title || "Untitled Recipe",
        image: imagePreview,
        images: [imagePreview],
        time: data.time ? parseInt(String(data.time)) : 30,
        servings: data.servings ? parseInt(String(data.servings)) : 2,
        difficulty: data.difficulty || "Medium",
        description: data.description || "",
        ingredients: Array.isArray(data.ingredients) ? data.ingredients.filter(i => i) : [],
        instructions: Array.isArray(data.instructions) ? data.instructions.filter(i => i) : [],
        tags: Array.isArray(data.tags) ? data.tags.filter(t => t) : []
      };
      
      setExtractedRecipe(recipeData);
      toast.success("Recipe extracted successfully");
    } catch (error) {
      console.error("Error processing recipe image:", error);
      toast.error(`Failed to extract recipe: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSaveRecipe = () => {
    if (extractedRecipe) {
      onRecipeExtracted(extractedRecipe);
      handleReset();
    }
  };
  
  const handleEditRecipe = () => {
    if (extractedRecipe) {
      onRecipeExtracted(extractedRecipe);
      handleReset();
    }
  };
  
  const handleReset = () => {
    setImagePreview(null);
    setExtractedRecipe(null);
    setNoTextDetected(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleReset()}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle>Add Recipe by Photo</DialogTitle>
          <DialogDescription>
            Take a photo of a recipe or upload one from your device.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          {isCapturing ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-[50vh] max-h-80 object-cover rounded-md bg-black"
              />
              <Button 
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-full w-16 h-16 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          ) : imagePreview && !extractedRecipe && !noTextDetected ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Recipe preview" 
                className="w-full h-[50vh] max-h-80 object-contain rounded-md"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-background/80"
                onClick={() => setImagePreview(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="mt-4 flex justify-center">
                <Button 
                  onClick={processImage} 
                  disabled={isProcessing}
                  className="flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting Recipe...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Extract Recipe
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : noTextDetected ? (
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={imagePreview!} 
                  alt="Recipe preview" 
                  className="w-full h-[50vh] max-h-80 object-contain rounded-md opacity-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-background/80"
                  onClick={() => setImagePreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No recipe text could be detected in this image. Please try a different image with clear recipe text.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setImagePreview(null)} 
                  variant="outline"
                >
                  Try Another Image
                </Button>
              </div>
            </div>
          ) : extractedRecipe ? (
            <div className="space-y-6">
              <div className={cn(
                "border-4 border-black rounded-xl p-4 shadow-neo"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold">{extractedRecipe.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-4">{extractedRecipe.description}</p>
                
                {extractedRecipe.tags && extractedRecipe.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {extractedRecipe.tags.map((tag, hidx) => (
                        <div key={hidx} className="bg-yellow-200 text-black text-xs px-2 py-1 rounded-full border-2 border-black flex items-center shadow-neo-sm">
                          <Star className="h-3 w-3 mr-1 text-amber-500" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm space-y-4">
                  <div>
                    <h4 className="font-bold mb-1">Ingredients:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {extractedRecipe.ingredients?.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-1">Instructions:</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      {extractedRecipe.instructions?.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {extractedRecipe.time && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {extractedRecipe.time} min
                      </div>
                    )}
                    {extractedRecipe.servings && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {extractedRecipe.servings} servings
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4 p-6">
              <Button onClick={startCamera} variant="outline" size="lg" className="w-full py-6">
                <Camera className="h-5 w-5 mr-2" />
                Take Photo
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                size="lg"
                className="w-full py-6"
              >
                <Image className="h-5 w-5 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </ScrollArea>
        
        <DialogFooter className="flex justify-between mt-4 pt-2 border-t">
          <Button variant="ghost" onClick={handleReset} disabled={isProcessing}>
            Cancel
          </Button>
          
          {extractedRecipe && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleEditRecipe} 
                variant="outline"
                className="flex items-center"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit in Form
              </Button>
              <Button 
                onClick={handleSaveRecipe}
                variant="default"
                className="flex items-center"
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save Recipe
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipePhotoCapture;

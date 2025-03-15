
import { useState, useRef } from "react";
import { Camera, Image, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RecipeFormData } from "@/hooks/useRecipes";

interface RecipePhotoCaptureProps {
  open: boolean;
  onClose: () => void;
  onRecipeExtracted: (recipe: Partial<RecipeFormData>) => void;
}

const RecipePhotoCapture = ({ open, onClose, onRecipeExtracted }: RecipePhotoCaptureProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    }
    
    stopCamera();
  };
  
  const processImage = async () => {
    if (!imagePreview) return;
    
    setIsProcessing(true);
    
    try {
      // Convert data URL to base64
      const base64Data = imagePreview.split(',')[1];
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke("extract-recipe-from-image", {
        body: { imageBase64: base64Data }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Ensure the data is not null or undefined
      if (!data) {
        throw new Error("Received empty data from image processing");
      }
      
      // Debug what we received
      console.log("Extracted recipe data:", data);
      
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
      
      toast.success("Recipe extracted successfully");
      
      // Close the dialog and pass the data to the parent component
      onRecipeExtracted(recipeData);
      handleReset();
    } catch (error) {
      console.error("Error processing recipe image:", error);
      toast.error(`Failed to extract recipe: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setImagePreview(null);
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
        
        <div className="space-y-4">
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
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full w-14 h-14 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          ) : imagePreview ? (
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
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4 p-6">
              <Button onClick={startCamera} variant="outline" size="lg" className="w-full sm:w-auto">
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
                className="w-full sm:w-auto"
              >
                <Image className="h-5 w-5 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        <DialogFooter className="flex justify-between mt-4 pt-2 border-t">
          <Button variant="ghost" onClick={handleReset} disabled={isProcessing}>
            Cancel
          </Button>
          {imagePreview && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipePhotoCapture;

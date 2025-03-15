
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
      
      // Process the extracted recipe data
      console.log("Extracted recipe data:", data);
      
      // Format the data for the form and include the image
      const recipeData: Partial<RecipeFormData> = {
        title: data.title || "Untitled Recipe",
        image: imagePreview,
        images: [imagePreview],
        time: data.time || 30,
        servings: data.servings || 2,
        difficulty: data.difficulty || "Medium",
        description: data.description || "",
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || []
      };
      
      toast.success("Recipe extracted successfully");
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
      <DialogContent className="sm:max-w-md">
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
                className="w-full h-64 object-cover rounded-md bg-black"
              />
              <Button 
                onClick={capturePhoto}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full w-12 h-12 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          ) : imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Recipe preview" 
                className="w-full h-64 object-contain rounded-md"
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
            <div className="flex justify-center gap-4">
              <Button onClick={startCamera} variant="outline" size="lg">
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
              >
                <Image className="h-5 w-5 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        <DialogFooter className="flex justify-between">
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

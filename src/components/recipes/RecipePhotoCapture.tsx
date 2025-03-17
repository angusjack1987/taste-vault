import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RecipeFormData } from '@/hooks/recipes/types';

export interface RecipePhotoCaptureProps {
  image?: string;
  onCapture: (imageUrl: string) => void;
  open?: boolean;
  onClose?: () => void;
  onRecipeExtracted?: (recipeData: Partial<RecipeFormData>) => void;
}

const RecipePhotoCapture: React.FC<RecipePhotoCaptureProps> = ({ 
  image, 
  onCapture,
  open = false,
  onClose,
  onRecipeExtracted
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(image || null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  
  const isDialogMode = open !== undefined && onClose !== undefined;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setCapturedImage(imageUrl);
        onCapture(imageUrl);
        
        if (onRecipeExtracted) {
          setTimeout(() => {
            onRecipeExtracted({
              title: '',
              ingredients: [],
              instructions: [],
              image: imageUrl
            });
          }, 500);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setCapturedImage(null);
    onCapture('');
  };
  
  const photoUploadContent = (
    <div className="space-y-2">
      {capturedImage ? (
        <div className="relative">
          <img 
            src={capturedImage} 
            alt="Recipe" 
            className="w-full h-64 object-cover rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Add a photo of your dish</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  if (isDialogMode) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Recipe Image</DialogTitle>
          </DialogHeader>
          {photoUploadContent}
        </DialogContent>
      </Dialog>
    );
  }
  
  return photoUploadContent;
};

export default RecipePhotoCapture;

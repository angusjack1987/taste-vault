
import React, { useState } from 'react';
import { ChefHat, ArrowRight, Utensils } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';

interface RecipeVariationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeName: string;
  onGenerateVariation: (type: string, preferences?: string) => Promise<void>;
  isLoading: boolean;
}

const RecipeVariationsDialog = ({
  open,
  onOpenChange,
  recipeName,
  onGenerateVariation,
  isLoading
}: RecipeVariationsDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('variation');
  const [dietaryPreferences, setDietaryPreferences] = useState<string>('');

  const handleGenerateClick = async () => {
    await onGenerateVariation(activeTab, dietaryPreferences);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-800">
            Recipe Variations for {recipeName}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue="variation" 
          className="mt-2" 
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid grid-cols-3 mb-6 bg-blue-50">
            <TabsTrigger 
              value="variation"
              className="data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:font-medium"
            >
              Variation
            </TabsTrigger>
            <TabsTrigger 
              value="remix"
              className="data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:font-medium"
            >
              Remix
            </TabsTrigger>
            <TabsTrigger 
              value="substitution"
              className="data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:font-medium"
            >
              Substitution
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="variation" className="mt-0 focus-visible:outline-none">
            <div className="flex flex-col items-center text-center px-4">
              <ChefHat className="w-16 h-16 text-green-800 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Create a Variation</h3>
              <p className="text-gray-600 mt-2 mb-6">
                Generate a delightful variation of this recipe that maintains its essence but offers a new experience.
              </p>
              
              <AiSuggestionButton
                onClick={handleGenerateClick}
                label="Generate Variation"
                className="w-full py-6 bg-green-800 hover:bg-green-700 text-white text-base font-medium"
                isLoading={isLoading}
                variant="default"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="remix" className="mt-0 focus-visible:outline-none">
            <div className="flex flex-col items-center text-center px-4">
              <div className="flex items-center justify-center mb-4">
                <Utensils className="w-14 h-14 text-green-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Creative Remix</h3>
              <p className="text-gray-600 mt-2 mb-6">
                Reimagine this recipe with creative twists, unexpected ingredients, or transformative techniques.
              </p>
              
              <AiSuggestionButton
                onClick={handleGenerateClick}
                label="Create Remix"
                className="w-full py-6 bg-green-800 hover:bg-green-700 text-white text-base font-medium"
                isLoading={isLoading}
                variant="default"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="substitution" className="mt-0 focus-visible:outline-none">
            <div className="flex flex-col items-center text-center px-4">
              <ArrowRight className="w-16 h-16 text-green-800 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Ingredient Substitutions</h3>
              <p className="text-gray-600 mt-2 mb-6">
                Adapt this recipe with ingredient substitutions for dietary needs while maintaining flavor and texture.
              </p>
              
              <div className="w-full mb-6">
                <Label htmlFor="dietaryNeeds">Dietary Need (optional)</Label>
                <Input
                  id="dietaryNeeds"
                  placeholder="e.g., gluten-free, dairy-free, vegan"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use your preferences from AI settings
                </p>
              </div>
              
              <AiSuggestionButton
                onClick={handleGenerateClick}
                label="Generate Substitutions"
                className="w-full py-6 bg-green-800 hover:bg-green-700 text-white text-base font-medium"
                isLoading={isLoading}
                variant="default"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeVariationsDialog;

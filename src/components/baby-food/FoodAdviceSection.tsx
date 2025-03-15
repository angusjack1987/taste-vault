
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Baby, Carrot, Apple, Info } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FoodAdviceSectionProps {
  babyAge: string;
  babyNames: string[];
}

const FoodAdviceSection: React.FC<FoodAdviceSectionProps> = ({ babyAge, babyNames }) => {
  const [food, setFood] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const handleGetAdvice = async () => {
    if (!food.trim()) {
      toast.error('Please enter a food item');
      return;
    }

    setIsLoadingModalOpen(true);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-baby-food', {
        body: {
          adviceRequest: true,
          food: food.trim(),
          babyAge: babyAge,
          babyName: babyNames.length > 0 ? babyNames[0] : undefined
        }
      });

      if (error) throw error;
      
      // Process the advice to remove any HTML tags
      const cleanAdvice = data.advice.replace(/<\/?[^>]+(>|$)/g, "");
      setAdvice(cleanAdvice);
      toast.success(`Generated advice for serving ${food}!`);
      setIsLoadingModalOpen(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error getting food advice:', error);
      toast.error('Failed to get advice. Please try again.');
      setIsLoadingModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Common foods for quick selection
  const commonFoods = [
    { name: 'Avocado', icon: <Carrot className="h-4 w-4" /> },
    { name: 'Banana', icon: <Apple className="h-4 w-4" /> },
    { name: 'Strawberries', icon: <Apple className="h-4 w-4" /> },
    { name: 'Eggs', icon: <Carrot className="h-4 w-4" /> },
    { name: 'Chicken', icon: <Carrot className="h-4 w-4" /> },
    { name: 'Sweet Potato', icon: <Carrot className="h-4 w-4" /> },
    { name: 'Broccoli', icon: <Carrot className="h-4 w-4" /> },
    { name: 'Yogurt', icon: <Apple className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6">
          <h2 className="text-xl font-black uppercase flex items-center">
            <Baby className="mr-2 h-5 w-5" />
            Food Serving Advice
          </h2>
          <p className="text-muted-foreground">Learn how to serve any food to your baby in an age-appropriate way</p>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {commonFoods.map((item) => (
              <Button
                key={item.name}
                variant="outline"
                size="sm"
                onClick={() => setFood(item.name)}
                className="flex items-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                {item.icon}
                <span className="ml-1">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex space-x-2">
          <Input
            placeholder="Enter a food item (e.g., avocado, eggs, chicken)"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="flex-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          />
          <AiSuggestionButton
            onClick={handleGetAdvice}
            label="Get Advice"
            isLoading={loading}
            size="default"
            className="border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          />
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Information is inspired by resources like SolidStarts but customized for your baby
        </div>
      </div>

      {/* Loading Modal */}
      <Dialog open={isLoadingModalOpen} onOpenChange={setIsLoadingModalOpen}>
        <DialogContent className="max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="py-8 flex flex-col items-center">
            <div className="animate-spin mb-4 border-4 border-primary border-t-transparent rounded-full h-12 w-12"></div>
            <h3 className="text-lg font-black uppercase mb-2">Generating Advice</h3>
            <p className="text-muted-foreground text-center">
              Finding the best ways to serve {food} for {babyNames.join(' & ') || 'your baby'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              How to serve {food} {babyNames.length > 0 && `to ${babyNames.join(' & ')}`}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mr-6 pr-6">
            <div className="p-4 space-y-4">
              <div className="prose prose-sm max-w-none">
                {advice && <p className="whitespace-pre-line">{advice}</p>}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodAdviceSection;

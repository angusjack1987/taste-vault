
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Baby, Carrot, Apple, Info } from 'lucide-react';
import StyledButton, { AddIcon } from '@/components/ui/styled-button';

interface FoodAdviceSectionProps {
  babyAge: string;
  babyNames: string[];
}

const FoodAdviceSection: React.FC<FoodAdviceSectionProps> = ({ babyAge, babyNames }) => {
  const [food, setFood] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    if (!food.trim()) {
      toast.error('Please enter a food item');
      return;
    }

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
      
      setAdvice(data.advice);
      toast.success(`Generated advice for serving ${food}!`);
    } catch (error) {
      console.error('Error getting food advice:', error);
      toast.error('Failed to get advice. Please try again.');
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
                shape="rounded"
                onClick={() => setFood(item.name)}
                className="flex items-center border-2 border-black"
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
            className="flex-1 border-2 border-black"
          />
          <Button
            onClick={handleGetAdvice}
            variant="add"
            shape="rounded"
            disabled={loading}
            className="h-10 px-4"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full border-4 border-current border-t-transparent animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <span>Get Advice</span>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Information is inspired by resources like SolidStarts but customized for your baby
        </div>
      </div>

      {advice && (
        <Card className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-secondary/20 pb-3">
            <CardTitle className="text-lg">
              How to serve {food} {babyNames.length > 0 && `to ${babyNames.join(' & ')}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: advice }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodAdviceSection;

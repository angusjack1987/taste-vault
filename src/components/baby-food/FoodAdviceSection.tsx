
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Baby, Carrot, Apple, Info, ChevronDown, Clock, Utensils } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

interface FoodAdviceSectionProps {
  babyAge: string;
  babyNames: string[];
}

const FoodAdviceSection: React.FC<FoodAdviceSectionProps> = ({ babyAge, babyNames }) => {
  const [food, setFood] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();

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
      
      // Clean the HTML tags if they exist
      let cleanedAdvice = data.advice;
      if (typeof cleanedAdvice === 'string') {
        cleanedAdvice = cleanedAdvice.replace(/```html|```/g, '').trim();
      }
      
      setAdvice(cleanedAdvice);
      setIsOpen(true); // Ensure the advice is open when newly generated
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
                onClick={() => setFood(item.name)}
                className="flex items-center bg-white hover:bg-[#f4f4f0] transition-colors"
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
            className="flex-1"
          />
          <AiSuggestionButton
            onClick={handleGetAdvice}
            label="Get Advice"
            isLoading={loading}
            size="default"
          />
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Information is inspired by resources like SolidStarts but customized for your baby
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg font-medium">Generating advice...</span>
        </div>
      )}

      {advice && !loading && (
        <Card className="overflow-hidden rounded-xl border-4 border-black">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="transition-all duration-300 ease-in-out"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold hover:bg-[#f4f4f0] transition-colors border-b-2 border-black/10">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">
                  How to serve {food} {babyNames.length > 0 && `to ${babyNames.join(' & ')}`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden md:flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3" />
                  <span>{babyAge} months</span>
                </Badge>
                <ChevronDown 
                  className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6 pt-4 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up bg-white">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: advice }} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default FoodAdviceSection;

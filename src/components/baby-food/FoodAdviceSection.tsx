
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AiSuggestionButton from '@/components/ui/ai-suggestion-button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Baby, Carrot, Apple, Info, ChevronDown, Clock, Utensils } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { CleanNeoBrutalistAccordion } from '@/components/ui/clean-accordion';

interface FoodAdviceSectionProps {
  babyAge: string;
  babyNames: string[];
}

const FoodAdviceSection: React.FC<FoodAdviceSectionProps> = ({ babyAge, babyNames }) => {
  const [food, setFood] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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
      
      let cleanedAdvice = data.advice;
      if (typeof cleanedAdvice === 'string') {
        cleanedAdvice = cleanedAdvice.replace(/```html|```/g, '').trim();
      }
      
      setAdvice(cleanedAdvice);
      setIsOpen(true);
      toast.success(`Generated advice for serving ${food}!`);
    } catch (error) {
      console.error('Error getting food advice:', error);
      toast.error('Failed to get advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pastelColors = [
    "bg-[#F2FCE2] hover:bg-[#E2ECd2]", // Soft Green
    "bg-[#FEF7CD] hover:bg-[#EEE7Bd]", // Soft Yellow
    "bg-[#FEC6A1] hover:bg-[#EEB691]", // Soft Orange
    "bg-[#E5DEFF] hover:bg-[#D5CEEF]", // Soft Purple
    "bg-[#FFDEE2] hover:bg-[#EFCED2]", // Soft Pink
    "bg-[#FDE1D3] hover:bg-[#EDD1C3]", // Soft Peach
    "bg-[#D3E4FD] hover:bg-[#C3D4ED]", // Soft Blue
  ];

  const getColorForItem = (index: number) => {
    return pastelColors[index % pastelColors.length];
  };

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
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
        <div className="mb-6">
          <h2 className="text-xl font-black uppercase flex items-center">
            <Baby className="mr-2 h-5 w-5" />
            Food Serving Advice
          </h2>
          <p className="text-muted-foreground">Learn how to serve any food to your baby in an age-appropriate way</p>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {commonFoods.map((item, index) => (
              <Button
                key={item.name}
                variant="outline"
                size="sm"
                onClick={() => setFood(item.name)}
                className={`flex items-center ${getColorForItem(index)} border-2 border-black text-black font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all`}
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
          <AiSuggestionButton
            onClick={handleGetAdvice}
            label="Get Advice"
            action="Analyze"
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
        <div className="py-10 text-center relative">
          <div className="absolute top-0 left-10 w-16 h-16 bg-[#FFDEE2] border-2 border-black rounded-full animate-neo-float opacity-40"></div>
          <div className="absolute bottom-10 right-10 w-14 h-14 bg-[#FEF7CD] border-2 border-black rounded-full animate-bounce opacity-30"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-[#D3E4FD] border-2 border-black rounded-full animate-pulse opacity-20"></div>
          <div className="absolute bottom-5 left-20 w-10 h-10 bg-[#F2FCE2] border-2 border-black rounded-full animate-neo-float opacity-30"></div>
          
          <div className="relative z-10 bg-white p-6 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] animate-pulse">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg font-bold">Generating baby food advice...</div>
          </div>
        </div>
      )}

      {advice && !loading && (
        <Card className="overflow-hidden rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300">
          <CleanNeoBrutalistAccordion
            value="food-advice"
            className="w-full bg-white"
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">
                    How to serve {food} {babyNames.length > 0 && `to ${babyNames.join(' & ')}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="hidden md:flex items-center gap-1 font-medium border-2 border-black bg-[#FEF7CD]">
                    <Clock className="h-3 w-3" />
                    <span>{babyAge} months</span>
                  </Badge>
                </div>
              </div>
            }
          >
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: advice }} />
            </div>
          </CleanNeoBrutalistAccordion>
        </Card>
      )}
    </div>
  );
};

export default FoodAdviceSection;

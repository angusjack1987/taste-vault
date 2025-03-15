
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BabyFoodGenerator from '@/components/baby-food/BabyFoodGenerator';
import FoodAdviceSection from '@/components/baby-food/FoodAdviceSection';
import SavedBabyRecipes from '@/components/baby-food/SavedBabyRecipes';
import { Button } from '@/components/ui/button';
import { Settings, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const BabyFoodPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [babyNames, setBabyNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [babyAge, setBabyAge] = useState<string>('');
  const [babyFoodPreferences, setBabyFoodPreferences] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('generator');
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBabyProfiles = async () => {
      if (!user) return;
      
      try {
        // Fetch baby profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('baby_profiles')
          .select('name, age_in_months')
          .eq('user_id', user.id)
          .order('name');
          
        if (profilesError) throw profilesError;
        
        if (profilesData && profilesData.length > 0) {
          setBabyNames(profilesData.map(profile => profile.name));
          setBabyAge(profilesData[0].age_in_months.toString());
        }

        // Fetch food preferences
        const { data: prefsData, error: prefsError } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (prefsError && prefsError.code !== 'PGRST116') throw prefsError;
        
        if (prefsData?.preferences) {
          // Check if preferences is an object and not a string
          const prefs = typeof prefsData.preferences === 'object' ? prefsData.preferences : {};

          // Safely access food property
          if (prefs && typeof prefs === 'object' && 'food' in prefs && typeof prefs.food === 'object' && prefs.food) {
            const foodPrefs = prefs.food as Record<string, any>;
            
            if ('babyFoodPreferences' in foodPrefs) {
              setBabyFoodPreferences(String(foodPrefs.babyFoodPreferences || ''));
            }
            
            if ('babyAge' in foodPrefs) {
              setBabyAge(String(foodPrefs.babyAge || ''));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching baby data:', error);
        toast.error('Failed to load baby information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBabyProfiles();
  }, [user]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Find and manually trigger the correct TabsTrigger
    const tabTrigger = document.querySelector(`[data-value="${value}"]`) as HTMLButtonElement | null;
    if (tabTrigger) {
      tabTrigger.click();
    }
  };

  if (loading) {
    return (
      <MainLayout title="Baby Food">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg font-medium">Loading baby food page...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Baby Food">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold uppercase">
            BABY FOOD
            {babyNames.length > 0 && ` FOR ${babyNames.join(' & ')}`}
          </h1>
          <Button 
            onClick={() => navigate('/settings/food-preferences')} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 bg-white"
          >
            <Settings size={16} />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 pb-4 scrollbar-none">
            <TabsList className="hidden">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="advice">Advice</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            
            {/* Neo-brutalist style menu buttons */}
            <Button 
              variant={activeTab === 'generator' ? 'cheese' : 'outline'}
              size="sm" 
              className="flex items-center whitespace-nowrap group"
              onClick={() => handleTabChange('generator')}
            >
              <Filter className="h-4 w-4 mr-1 group-hover:animate-spin-neo" />
              <span className="font-bold uppercase">Recipe Generator</span>
            </Button>
            
            <Button 
              variant={activeTab === 'advice' ? 'cheese' : 'outline'}
              size="sm" 
              className="flex items-center whitespace-nowrap group"
              onClick={() => handleTabChange('advice')}
            >
              <Filter className="h-4 w-4 mr-1 group-hover:animate-spin-neo" />
              <span className="font-bold uppercase">Food Advice</span>
            </Button>
            
            <Button 
              variant={activeTab === 'saved' ? 'cheese' : 'outline'}
              size="sm" 
              className="flex items-center whitespace-nowrap group"
              onClick={() => handleTabChange('saved')}
            >
              <Filter className="h-4 w-4 mr-1 group-hover:animate-spin-neo" />
              <span className="font-bold uppercase">Saved Recipes</span>
            </Button>
          </div>
          
          <TabsContent value="generator" className="mt-6">
            <BabyFoodGenerator 
              babyAge={babyAge} 
              babyNames={babyNames}
              babyFoodPreferences={babyFoodPreferences}
            />
          </TabsContent>
          
          <TabsContent value="advice" className="mt-6">
            <FoodAdviceSection 
              babyAge={babyAge}
              babyNames={babyNames}
            />
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <SavedBabyRecipes />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BabyFoodPage;

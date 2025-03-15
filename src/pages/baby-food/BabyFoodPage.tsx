
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BabyFoodGenerator from '@/components/baby-food/BabyFoodGenerator';
import FoodAdviceSection from '@/components/baby-food/FoodAdviceSection';
import SavedBabyRecipes from '@/components/baby-food/SavedBabyRecipes';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';

const BabyFoodPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [babyNames, setBabyNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [babyAge, setBabyAge] = useState<string>('');
  const [babyFoodPreferences, setBabyFoodPreferences] = useState<string>('');

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
          const prefs = prefsData.preferences;
          if (prefs.food && prefs.food.babyFoodPreferences) {
            setBabyFoodPreferences(prefs.food.babyFoodPreferences);
          }
          if (prefs.food && prefs.food.babyAge) {
            setBabyAge(prefs.food.babyAge);
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
          <h1 className="text-2xl md:text-3xl font-black uppercase">
            Baby Food
            {babyNames.length > 0 && ` for ${babyNames.join(' & ')}`}
          </h1>
          <Button 
            onClick={() => navigate('/settings/food-preferences')} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="generator">Recipe Generator</TabsTrigger>
            <TabsTrigger value="advice">Food Advice</TabsTrigger>
            <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
          </TabsList>
          
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

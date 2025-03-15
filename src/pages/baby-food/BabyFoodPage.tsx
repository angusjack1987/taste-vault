
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
    if (!user) return;
    
    const fetchBabyProfiles = async () => {
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
          // Safely check if preferences exists and is an object
          const prefs = typeof prefsData.preferences === 'object' ? prefsData.preferences : {};

          // Safely access food property with proper type checking
          if (prefs && typeof prefs === 'object' && !Array.isArray(prefs)) {
            // Check if 'food' exists and is an object before accessing it
            const foodPrefs = 'food' in prefs && 
                             typeof prefs.food === 'object' && 
                             prefs.food !== null && 
                             !Array.isArray(prefs.food) ? 
                             prefs.food : {};
            
            if (foodPrefs && typeof foodPrefs === 'object') {
              // Use optional chaining and nullish coalescing to safely access properties
              if ('babyFoodPreferences' in foodPrefs) {
                setBabyFoodPreferences(String(foodPrefs.babyFoodPreferences || ''));
              }
              
              if ('babyAge' in foodPrefs) {
                setBabyAge(String(foodPrefs.babyAge || ''));
              }
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
            className="flex items-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <Settings size={16} />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full border-2 border-black">
            <TabsTrigger value="generator" className="data-[state=active]:bg-primary font-bold">Recipe Generator</TabsTrigger>
            <TabsTrigger value="advice" className="data-[state=active]:bg-primary font-bold">Food Advice</TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-primary font-bold">Saved Recipes</TabsTrigger>
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

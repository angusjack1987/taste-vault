import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

interface FoodPreferences {
  favoriteCuisines: string;
  favoriteChefs: string;
  ingredientsToAvoid: string;
  dietaryNotes: string;
}

const FoodPreferences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<FoodPreferences>({
    favoriteCuisines: "",
    favoriteChefs: "",
    ingredientsToAvoid: "",
    dietaryNotes: ""
  });

  // Fetch existing preferences when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.preferences && typeof data.preferences === 'object') {
          const foodPrefs = data.preferences.food || {};
          setPreferences({
            favoriteCuisines: foodPrefs.favoriteCuisines || "",
            favoriteChefs: foodPrefs.favoriteChefs || "",
            ingredientsToAvoid: foodPrefs.ingredientsToAvoid || "",
            dietaryNotes: foodPrefs.dietaryNotes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching food preferences:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save preferences");
      return;
    }
    
    setLoading(true);
    try {
      // First check if user already has preferences
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id, preferences')
        .eq('user_id', user.id)
        .single();
      
      const foodPreferences = {
        favoriteCuisines: preferences.favoriteCuisines,
        favoriteChefs: preferences.favoriteChefs,
        ingredientsToAvoid: preferences.ingredientsToAvoid,
        dietaryNotes: preferences.dietaryNotes
      };
      
      if (existingPrefs) {
        // Update existing preferences with proper type checking
        const currentPrefs = typeof existingPrefs.preferences === 'object' ? 
          existingPrefs.preferences : {};
          
        const updatedPreferences = {
          ...currentPrefs,
          food: foodPreferences
        };
        
        const { error } = await supabase
          .from('user_preferences')
          .update({ preferences: updatedPreferences })
          .eq('id', existingPrefs.id);
          
        if (error) throw error;
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            preferences: { food: foodPreferences }
          });
          
        if (error) throw error;
      }
      
      toast.success("Food preferences saved successfully");
      navigate('/settings');
    } catch (error) {
      console.error("Error saving food preferences:", error);
      toast.error("Failed to save food preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Food Preferences">
      <div className="page-container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="favoriteCuisines">Favorite Cuisines</Label>
              <Input
                id="favoriteCuisines"
                name="favoriteCuisines"
                placeholder="Italian, Thai, Mexican, etc."
                value={preferences.favoriteCuisines}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate multiple cuisines with commas
              </p>
            </div>
            
            <div>
              <Label htmlFor="favoriteChefs">Favorite Chefs or Cooks</Label>
              <Input
                id="favoriteChefs"
                name="favoriteChefs"
                placeholder="Gordon Ramsay, Julia Child, etc."
                value={preferences.favoriteChefs}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Chefs or cooks whose recipes you enjoy
              </p>
            </div>
            
            <div>
              <Label htmlFor="ingredientsToAvoid">Ingredients to Avoid</Label>
              <Textarea
                id="ingredientsToAvoid"
                name="ingredientsToAvoid"
                placeholder="Cilantro, bell peppers, etc."
                value={preferences.ingredientsToAvoid}
                onChange={handleChange}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Ingredients you dislike or want to avoid
              </p>
            </div>
            
            <div>
              <Label htmlFor="dietaryNotes">Additional Notes</Label>
              <Textarea
                id="dietaryNotes"
                name="dietaryNotes"
                placeholder="Any other food preferences or notes..."
                value={preferences.dietaryNotes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Any other preferences that might help with recipe suggestions
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/settings')}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FoodPreferences;

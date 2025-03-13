
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/ui/tag-input";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { debounce } from "lodash";

interface FoodPreferences {
  favoriteCuisines: string;
  favoriteChefs: string;
  ingredientsToAvoid: string;
  dietaryNotes: string;
}

interface UserPreferences {
  food?: FoodPreferences;
  [key: string]: any;
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

  // Tag inputs state
  const [cuisineTags, setCuisineTags] = useState<string[]>([]);
  const [chefTags, setChefTags] = useState<string[]>([]);
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  
  // Create a debounced save function to prevent too many saves
  const debouncedSave = useRef(
    debounce(async (prefsToSave: FoodPreferences) => {
      if (!user) return;
      try {
        await savePreferences(prefsToSave);
        toast.success("Food preferences saved", { id: "auto-save" });
      } catch (error) {
        console.error("Auto-save error:", error);
        toast.error("Failed to auto-save", { id: "auto-save-error" });
      }
    }, 1500)
  ).current;

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
        
        if (data?.preferences && 
            typeof data.preferences === 'object' && 
            !Array.isArray(data.preferences)) {
          const userPrefs = data.preferences as UserPreferences;
          if (userPrefs.food) {
            setPreferences({
              favoriteCuisines: userPrefs.food.favoriteCuisines || "",
              favoriteChefs: userPrefs.food.favoriteChefs || "",
              ingredientsToAvoid: userPrefs.food.ingredientsToAvoid || "",
              dietaryNotes: userPrefs.food.dietaryNotes || ""
            });

            // Split existing values into tags
            if (userPrefs.food.favoriteCuisines) {
              setCuisineTags(userPrefs.food.favoriteCuisines.split(',').map(tag => tag.trim()).filter(Boolean));
            }
            if (userPrefs.food.favoriteChefs) {
              setChefTags(userPrefs.food.favoriteChefs.split(',').map(tag => tag.trim()).filter(Boolean));
            }
            if (userPrefs.food.ingredientsToAvoid) {
              setAvoidTags(userPrefs.food.ingredientsToAvoid.split(',').map(tag => tag.trim()).filter(Boolean));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching food preferences:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  // Handle input changes for non-tag fields
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedPreferences = {
      ...preferences,
      [name]: value
    };
    setPreferences(updatedPreferences);
    
    // Trigger auto-save
    debouncedSave(updatedPreferences);
  };

  // Update preferences state when tags change
  const handleTagsChange = (tags: string[], field: keyof FoodPreferences) => {
    const updatedPreferences = {
      ...preferences,
      [field]: tags.join(", ")
    };
    setPreferences(updatedPreferences);
    
    // Trigger auto-save
    debouncedSave(updatedPreferences);
  };

  const savePreferences = async (prefsToSave: FoodPreferences) => {
    if (!user) {
      toast.error("You must be logged in to save preferences");
      return;
    }
    
    try {
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id, preferences')
        .eq('user_id', user.id)
        .single();
      
      const foodPreferences: FoodPreferences = {
        favoriteCuisines: prefsToSave.favoriteCuisines,
        favoriteChefs: prefsToSave.favoriteChefs,
        ingredientsToAvoid: prefsToSave.ingredientsToAvoid,
        dietaryNotes: prefsToSave.dietaryNotes
      };
      
      if (existingPrefs) {
        const currentPrefs: UserPreferences = 
          (typeof existingPrefs.preferences === 'object' && !Array.isArray(existingPrefs.preferences)) 
            ? (existingPrefs.preferences as UserPreferences) 
            : {};
          
        // Create a new object that conforms to Json type
        const updatedPreferences: Record<string, any> = {
          ...currentPrefs,
          food: foodPreferences
        };
        
        const { error } = await supabase
          .from('user_preferences')
          .update({ preferences: updatedPreferences as Json })
          .eq('id', existingPrefs.id);
          
        if (error) throw error;
      } else {
        // Create a new object that conforms to Json type
        const newPreferences: Record<string, any> = {
          food: foodPreferences
        };
        
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            preferences: newPreferences as Json
          });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving food preferences:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await savePreferences(preferences);
      toast.success("Food preferences saved successfully");
      navigate('/settings');
    } catch (error) {
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
              <TagInput
                id="favoriteCuisines"
                tags={cuisineTags}
                setTags={setCuisineTags}
                placeholder="Type cuisine and press Enter or comma to add"
                onTagsChange={(tags) => handleTagsChange(tags, 'favoriteCuisines')}
                preserveFocus={true}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate multiple cuisines with Enter key or comma
              </p>
            </div>
            
            <div>
              <Label htmlFor="favoriteChefs">Favorite Chefs or Cooks</Label>
              <TagInput
                id="favoriteChefs"
                tags={chefTags}
                setTags={setChefTags}
                placeholder="Type chef name and press Enter or comma to add"
                onTagsChange={(tags) => handleTagsChange(tags, 'favoriteChefs')}
                preserveFocus={true}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Chefs or cooks whose recipes you enjoy
              </p>
            </div>
            
            <div>
              <Label htmlFor="ingredientsToAvoid">Ingredients to Avoid</Label>
              <TagInput
                id="ingredientsToAvoid"
                tags={avoidTags}
                setTags={setAvoidTags}
                placeholder="Type ingredient and press Enter or comma to add"
                onTagsChange={(tags) => handleTagsChange(tags, 'ingredientsToAvoid')}
                preserveFocus={true}
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

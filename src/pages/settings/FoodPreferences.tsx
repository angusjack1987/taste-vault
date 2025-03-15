
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
import { Switch } from "@/components/ui/switch";
import AiSuggestionTooltip from "@/components/ui/ai-suggestion-tooltip";
import { Baby, ChefHat } from "lucide-react";
import BabyProfilesForm from "@/components/baby-food/BabyProfilesForm";

interface FoodPreferences {
  favoriteCuisines: string;
  favoriteChefs: string;
  ingredientsToAvoid: string;
  dietaryNotes: string;
  babyFoodEnabled?: boolean;
  babyFoodPreferences?: string;
  babyAge?: string;
  babyLedWeaning?: boolean;
  suitableBabyIngredients?: string;
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
    dietaryNotes: "",
    babyFoodEnabled: false,
    babyFoodPreferences: "",
    babyAge: "",
    babyLedWeaning: false,
    suitableBabyIngredients: ""
  });

  const [cuisineTags, setCuisineTags] = useState<string[]>([]);
  const [chefTags, setChefTags] = useState<string[]>([]);
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  const [babyIngredientTags, setBabyIngredientTags] = useState<string[]>([]);
  
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
              dietaryNotes: userPrefs.food.dietaryNotes || "",
              babyFoodEnabled: userPrefs.food.babyFoodEnabled || false,
              babyFoodPreferences: userPrefs.food.babyFoodPreferences || "",
              babyAge: userPrefs.food.babyAge || "",
              babyLedWeaning: userPrefs.food.babyLedWeaning || false,
              suitableBabyIngredients: userPrefs.food.suitableBabyIngredients || ""
            });

            if (userPrefs.food.favoriteCuisines) {
              setCuisineTags(userPrefs.food.favoriteCuisines.split(',').map(tag => tag.trim()).filter(Boolean));
            }
            if (userPrefs.food.favoriteChefs) {
              setChefTags(userPrefs.food.favoriteChefs.split(',').map(tag => tag.trim()).filter(Boolean));
            }
            if (userPrefs.food.ingredientsToAvoid) {
              setAvoidTags(userPrefs.food.ingredientsToAvoid.split(',').map(tag => tag.trim()).filter(Boolean));
            }
            if (userPrefs.food.suitableBabyIngredients) {
              setBabyIngredientTags(userPrefs.food.suitableBabyIngredients.split(',').map(tag => tag.trim()).filter(Boolean));
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedPreferences = {
      ...preferences,
      [name]: value
    };
    setPreferences(updatedPreferences);
    
    debouncedSave(updatedPreferences);
  };

  const handleSwitchChange = (checked: boolean, field: keyof FoodPreferences) => {
    const updatedPreferences = {
      ...preferences,
      [field]: checked
    };
    setPreferences(updatedPreferences);
    
    debouncedSave(updatedPreferences);
  };

  const handleTagsChange = (tags: string[], field: keyof FoodPreferences) => {
    const updatedPreferences = {
      ...preferences,
      [field]: tags.join(", ")
    };
    setPreferences(updatedPreferences);
    
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
        dietaryNotes: prefsToSave.dietaryNotes,
        babyFoodEnabled: prefsToSave.babyFoodEnabled,
        babyFoodPreferences: prefsToSave.babyFoodPreferences,
        babyAge: prefsToSave.babyAge,
        babyLedWeaning: prefsToSave.babyLedWeaning,
        suitableBabyIngredients: prefsToSave.suitableBabyIngredients
      };
      
      if (existingPrefs) {
        const currentPrefs: UserPreferences = 
          (typeof existingPrefs.preferences === 'object' && !Array.isArray(existingPrefs.preferences)) 
            ? (existingPrefs.preferences as UserPreferences) 
            : {};
          
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
    
    // Check if the user is currently entering a tag
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.tagName === 'INPUT') {
      const inputValue = (activeElement as HTMLInputElement).value.trim();
      if (inputValue) {
        // Let the TagInput handle this
        return;
      }
    }
    
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

            {/* Baby Food Section */}
            <div className="pt-4 border-t mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Baby className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Baby Food</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="babyFoodEnabled" className="cursor-pointer">Enable Baby Food</Label>
                  <AiSuggestionTooltip content="Enable this to get baby food recommendations and access baby food features">
                    <Switch
                      id="babyFoodEnabled"
                      checked={preferences.babyFoodEnabled}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'babyFoodEnabled')}
                    />
                  </AiSuggestionTooltip>
                </div>
              </div>

              {preferences.babyFoodEnabled && (
                <div className="space-y-6 mt-4 bg-secondary/10 p-5 rounded-lg">
                  {/* Baby Profiles */}
                  <BabyProfilesForm />
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <ChefHat className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Baby Food Preferences</h3>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="babyLedWeaning"
                          checked={preferences.babyLedWeaning}
                          onCheckedChange={(checked) => handleSwitchChange(checked, 'babyLedWeaning')}
                        />
                        <Label htmlFor="babyLedWeaning" className="cursor-pointer">
                          Baby-Led Weaning
                        </Label>
                        <AiSuggestionTooltip content="Focus on finger foods that baby can self-feed, rather than purees" />
                      </div>
                      
                      <div>
                        <Label htmlFor="babyAge">Baby Age (months)</Label>
                        <Textarea
                          id="babyAge"
                          name="babyAge"
                          placeholder="Enter baby's age in months (e.g. 6, 9, 12)"
                          value={preferences.babyAge || ""}
                          onChange={handleChange}
                          className="h-10 resize-none"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          This helps recommend age-appropriate baby foods
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="suitableBabyIngredients">Suitable Baby Ingredients</Label>
                        <TagInput
                          id="suitableBabyIngredients"
                          tags={babyIngredientTags}
                          setTags={setBabyIngredientTags}
                          placeholder="Type ingredient and press Enter"
                          onTagsChange={(tags) => handleTagsChange(tags, 'suitableBabyIngredients')}
                          preserveFocus={true}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Ingredients you prefer to use for baby food
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="babyFoodPreferences">Additional Baby Food Preferences</Label>
                        <Textarea
                          id="babyFoodPreferences"
                          name="babyFoodPreferences"
                          placeholder="Any preferences for baby food (allergies, textures, etc.)"
                          value={preferences.babyFoodPreferences || ""}
                          onChange={handleChange}
                          className="min-h-[100px]"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          E.g., Boob to Food approach, vegan options, iron-rich foods, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

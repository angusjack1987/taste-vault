
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { debounce } from "lodash";
import { Switch } from "@/components/ui/switch";
import AiSuggestionTooltip from "@/components/ui/ai-suggestion-tooltip";
import { Baby, Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Popular cuisine suggestions
const popularCuisines = [
  "Italian", "French", "Chinese", "Japanese", "Thai", "Mexican", "Indian", 
  "Mediterranean", "Greek", "Lebanese", "Turkish", "Spanish", "Korean", 
  "Vietnamese", "American", "Cajun", "Southern", "Brazilian", "Peruvian", 
  "Moroccan", "Ethiopian", "British", "German", "Russian", "Caribbean"
];

// Popular chefs and cookbook suggestions
const popularChefsAndCookbooks = [
  "Julia Child", "Gordon Ramsay", "Jamie Oliver", "Nigella Lawson", 
  "Ina Garten", "Alton Brown", "Samin Nosrat", "Anthony Bourdain", 
  "Yotam Ottolenghi", "Jacques Pépin", "Massimo Bottura", "Dominique Ansel",
  "Salt Fat Acid Heat", "The Joy of Cooking", "Mastering the Art of French Cooking",
  "Essentials of Italian Cooking", "The Food Lab", "How to Cook Everything"
];

interface FoodPreferences {
  favoriteCuisines: string;
  favoriteChefs: string;
  ingredientsToAvoid: string;
  dietaryNotes: string;
  babyFoodEnabled?: boolean;
  babyFoodPreferences?: string;
  babyAge?: string;
}

interface UserPreferences {
  food?: FoodPreferences;
  [key: string]: any;
}

interface AutocompleteInputProps {
  suggestions: string[];
  selectedItems: string[];
  placeholder: string;
  onSelectItem: (item: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  suggestions,
  selectedItems,
  placeholder,
  onSelectItem
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter suggestions that aren't already selected
  const filteredSuggestions = suggestions
    .filter(item => !selectedItems.includes(item))
    .filter(item => 
      item.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground h-auto min-h-10 py-2"
        >
          {selectedItems.length > 0 ? (
            <div className="flex flex-wrap gap-1 items-center justify-start w-full">
              {selectedItems.map(item => (
                <span key={item} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder}`} 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredSuggestions.map(item => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => {
                    onSelectItem(item);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItems.includes(item) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

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
    babyAge: ""
  });

  const [cuisineTags, setCuisineTags] = useState<string[]>([]);
  const [chefTags, setChefTags] = useState<string[]>([]);
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  
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
              babyAge: userPrefs.food.babyAge || ""
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

  const handleSwitchChange = (checked: boolean) => {
    const updatedPreferences = {
      ...preferences,
      babyFoodEnabled: checked
    };
    setPreferences(updatedPreferences);
    
    debouncedSave(updatedPreferences);
  };

  const handleSelectCuisine = (cuisine: string) => {
    const newCuisineTags = [...cuisineTags, cuisine];
    setCuisineTags(newCuisineTags);
    updatePreferencesWithTags(newCuisineTags, 'favoriteCuisines');
  };

  const handleSelectChef = (chef: string) => {
    const newChefTags = [...chefTags, chef];
    setChefTags(newChefTags);
    updatePreferencesWithTags(newChefTags, 'favoriteChefs');
  };

  const handleSelectIngredientToAvoid = (ingredient: string) => {
    const newAvoidTags = [...avoidTags, ingredient];
    setAvoidTags(newAvoidTags);
    updatePreferencesWithTags(newAvoidTags, 'ingredientsToAvoid');
  };

  const updatePreferencesWithTags = (tags: string[], field: keyof FoodPreferences) => {
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
        babyAge: prefsToSave.babyAge
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
      <div className="page-container max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">General Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="favoriteCuisines" className="text-base">
                  Favorite Cuisines
                </Label>
                <AutocompleteInput
                  suggestions={popularCuisines}
                  selectedItems={cuisineTags}
                  placeholder="Select cuisines or type to search"
                  onSelectItem={handleSelectCuisine}
                />
                {cuisineTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cuisineTags.map(cuisine => (
                      <span
                        key={cuisine}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-sage-100 text-sage-800 cursor-pointer hover:bg-sage-200"
                        onClick={() => {
                          const newTags = cuisineTags.filter(c => c !== cuisine);
                          setCuisineTags(newTags);
                          updatePreferencesWithTags(newTags, 'favoriteCuisines');
                        }}
                      >
                        {cuisine} ×
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Select your favorite cuisines for better recipe recommendations
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="favoriteChefs" className="text-base">
                  Favorite Chefs or Cookbooks
                </Label>
                <AutocompleteInput
                  suggestions={popularChefsAndCookbooks}
                  selectedItems={chefTags}
                  placeholder="Select chefs/cookbooks or type to search"
                  onSelectItem={handleSelectChef}
                />
                {chefTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {chefTags.map(chef => (
                      <span
                        key={chef}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-sage-100 text-sage-800 cursor-pointer hover:bg-sage-200"
                        onClick={() => {
                          const newTags = chefTags.filter(c => c !== chef);
                          setChefTags(newTags);
                          updatePreferencesWithTags(newTags, 'favoriteChefs');
                        }}
                      >
                        {chef} ×
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Select chefs or cookbooks whose recipes you enjoy
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="ingredientsToAvoid" className="text-base">
                  Ingredients to Avoid
                </Label>
                <AutocompleteInput
                  suggestions={[]} // No predefined suggestions, user will type their own
                  selectedItems={avoidTags}
                  placeholder="Type ingredient to avoid and press Enter"
                  onSelectItem={handleSelectIngredientToAvoid}
                />
                {avoidTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {avoidTags.map(ingredient => (
                      <span
                        key={ingredient}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-rose-100 text-rose-800 cursor-pointer hover:bg-rose-200"
                        onClick={() => {
                          const newTags = avoidTags.filter(i => i !== ingredient);
                          setAvoidTags(newTags);
                          updatePreferencesWithTags(newTags, 'ingredientsToAvoid');
                        }}
                      >
                        {ingredient} ×
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Ingredients you dislike or want to avoid in recipes
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="dietaryNotes" className="text-base">
                  Additional Notes
                </Label>
                <Textarea
                  id="dietaryNotes"
                  name="dietaryNotes"
                  placeholder="Any other food preferences or notes..."
                  value={preferences.dietaryNotes}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Any other preferences that might help with recipe suggestions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Baby Food Section */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Baby Food</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="babyFoodEnabled" className="cursor-pointer">Enable Baby Food</Label>
                <AiSuggestionTooltip content="Enable this to get baby food recommendations and access baby food features">
                  <Switch
                    id="babyFoodEnabled"
                    checked={preferences.babyFoodEnabled}
                    onCheckedChange={handleSwitchChange}
                  />
                </AiSuggestionTooltip>
              </div>
            </CardHeader>

            {preferences.babyFoodEnabled && (
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="babyAge" className="text-base">Baby Age (months)</Label>
                  <Textarea
                    id="babyAge"
                    name="babyAge"
                    placeholder="Enter baby's age in months (e.g. 6, 9, 12)"
                    value={preferences.babyAge || ""}
                    onChange={handleChange}
                    className="h-10 resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    This helps recommend age-appropriate baby foods
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="babyFoodPreferences" className="text-base">Baby Food Preferences</Label>
                  <Textarea
                    id="babyFoodPreferences"
                    name="babyFoodPreferences"
                    placeholder="Any preferences for baby food (allergies, textures, etc.)"
                    value={preferences.babyFoodPreferences || ""}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Note any preferences, allergies, or foods your baby enjoys
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
          
          <div className="flex justify-end gap-4 pt-4">
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

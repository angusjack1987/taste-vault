import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { Json } from "@/integrations/supabase/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TagInput from "@/components/ui/tag-input";
import {
  User,
  Utensils,
  Clock,
  ChefHat,
  ArrowRight,
  Baby,
  Heart,
  Check,
} from "lucide-react";

// Define the step types
type OnboardingStep = "welcome" | "profile" | "foodPreferences" | "babyFood" | "complete";

// Define form schema for profile step
const profileSchema = z.object({
  first_name: z.string().min(1, "Please enter your name"),
});

// Define form schema for food preferences step
const foodPreferencesSchema = z.object({
  favoriteCuisines: z.string().optional(),
  ingredientsToAvoid: z.string().optional(),
  dietaryNotes: z.string().optional(),
});

// Define form schema for baby food step
const babyFoodSchema = z.object({
  babyFoodEnabled: z.boolean().default(false),
  babyAge: z.string().optional(),
  babyLedWeaning: z.boolean().default(false),
  suitableBabyIngredients: z.string().optional(),
  babyFoodPreferences: z.string().optional(),
});

// Component variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  },
  exit: { 
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Type for user preferences
type UserPreferences = {
  food?: {
    favoriteCuisines?: string;
    ingredientsToAvoid?: string;
    dietaryNotes?: string;
    babyFoodEnabled?: boolean;
    babyAge?: string;
    babyLedWeaning?: boolean;
    suitableBabyIngredients?: string;
    babyFoodPreferences?: string;
  };
};

const OnboardingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [enableBabyFood, setEnableBabyFood] = useState(false);
  
  // Tag states
  const [cuisineTags, setCuisineTags] = useState<string[]>([]);
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  const [babyIngredientTags, setBabyIngredientTags] = useState<string[]>([]);

  // Form handling
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
    },
  });

  const foodPreferencesForm = useForm<z.infer<typeof foodPreferencesSchema>>({
    resolver: zodResolver(foodPreferencesSchema),
    defaultValues: {
      favoriteCuisines: "",
      ingredientsToAvoid: "",
      dietaryNotes: "",
    },
  });

  const babyFoodForm = useForm<z.infer<typeof babyFoodSchema>>({
    resolver: zodResolver(babyFoodSchema),
    defaultValues: {
      babyFoodEnabled: true,
      babyAge: "",
      babyLedWeaning: false,
      suitableBabyIngredients: "",
      babyFoodPreferences: "",
    },
  });

  // Handle welcome step completion
  const handleWelcomeComplete = () => {
    setCurrentStep("profile");
  };

  // Handle profile step submission
  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update user profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Move to next step
      setCurrentStep("foodPreferences");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Handle food preferences step submission
  const onFoodPreferencesSubmit = async (values: z.infer<typeof foodPreferencesSchema>) => {
    if (!user) return;

    try {
      // Prepare user preferences object
      const foodPreferences = {
        favoriteCuisines: cuisineTags.join(", "),
        ingredientsToAvoid: avoidTags.join(", "),
        dietaryNotes: values.dietaryNotes || "",
        babyFoodEnabled: enableBabyFood,
      };

      // Check if user already has preferences
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id, preferences")
        .eq("user_id", user.id)
        .single();

      const updatedPreferences: UserPreferences = {
        food: foodPreferences,
      };

      if (existingPrefs) {
        // Update existing preferences
        const existingPrefsObj = existingPrefs.preferences as Record<string, any> || {};
        
        const { error } = await supabase
          .from("user_preferences")
          .update({ 
            preferences: {
              ...existingPrefsObj,
              food: foodPreferences
            }
          })
          .eq("id", existingPrefs.id);

        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            preferences: updatedPreferences,
          });

        if (error) throw error;
      }

      // Move to next step
      if (enableBabyFood) {
        setCurrentStep("babyFood");
      } else {
        setCurrentStep("complete");
      }
    } catch (error) {
      console.error("Error saving food preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save food preferences",
        variant: "destructive",
      });
    }
  };

  // Handle baby food step submission
  const onBabyFoodSubmit = async (values: z.infer<typeof babyFoodSchema>) => {
    if (!user) return;

    try {
      // Get existing preferences
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id, preferences")
        .eq("user_id", user.id)
        .single();

      if (!existingPrefs) throw new Error("Preferences not found");

      // Update baby food preferences
      const babyFoodPreferences = {
        babyFoodEnabled: true,
        babyAge: values.babyAge || "",
        babyLedWeaning: values.babyLedWeaning,
        suitableBabyIngredients: babyIngredientTags.join(", "),
        babyFoodPreferences: values.babyFoodPreferences || "",
      };

      // Update existing preferences
      const existingPrefsObj = existingPrefs.preferences as Record<string, any> || {};
      const existingFoodPrefs = existingPrefsObj.food || {};
      
      const { error } = await supabase
        .from("user_preferences")
        .update({ 
          preferences: {
            ...existingPrefsObj,
            food: {
              ...existingFoodPrefs,
              ...babyFoodPreferences
            }
          }
        })
        .eq("id", existingPrefs.id);

      if (error) throw error;

      // Move to complete step
      setCurrentStep("complete");
    } catch (error) {
      console.error("Error saving baby food preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save baby food preferences",
        variant: "destructive",
      });
    }
  };

  // Handle completion and navigate to dashboard
  const finishOnboarding = async () => {
    try {
      // Force refresh the onboarding status before navigating
      if (user) {
        // This ensures the AuthGuard component will have the updated status
        const { data } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (data) {
          // Successfully completed onboarding
          toast({
            title: "Onboarding complete!",
            description: "Your preferences have been saved.",
          });
        }
      }
      
      // Navigate to dashboard
      navigate("/");
    } catch (error) {
      console.error("Error finishing onboarding:", error);
      // Still navigate to dashboard even if the check fails
      navigate("/");
    }
  };

  // Welcome step content
  const renderWelcomeStep = () => (
    <motion.div
      className="flex flex-col items-center text-center space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
        <ChefHat className="h-12 w-12 text-white" />
      </motion.div>
      
      <motion.h1 variants={itemVariants} className="text-3xl font-bold">
        Welcome to MealMaster!
      </motion.h1>
      
      <motion.p variants={itemVariants} className="text-lg max-w-md text-muted-foreground">
        Let's get your account set up so we can tailor the experience just for you.
      </motion.p>
      
      <motion.div variants={itemVariants} className="space-y-4 w-full max-w-md">
        <div className="flex items-center p-4 border-2 border-black rounded-lg bg-secondary/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <User className="h-6 w-6 text-primary mr-4" />
          <div className="text-left">
            <h3 className="font-medium">Your Profile</h3>
            <p className="text-sm text-muted-foreground">Tell us who you are</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border-2 border-black rounded-lg bg-secondary/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <Utensils className="h-6 w-6 text-primary mr-4" />
          <div className="text-left">
            <h3 className="font-medium">Food Preferences</h3>
            <p className="text-sm text-muted-foreground">Customize your food experience</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border-2 border-black rounded-lg bg-secondary/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <Baby className="h-6 w-6 text-primary mr-4" />
          <div className="text-left">
            <h3 className="font-medium">Baby Food (Optional)</h3>
            <p className="text-sm text-muted-foreground">Setup for little ones</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Button onClick={handleWelcomeComplete} className="mt-4 group">
          Let's Go
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );

  // Profile step content
  const renderProfileStep = () => (
    <motion.div
      className="max-w-md w-full mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">Let's get to know you better</p>
      </motion.div>

      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <FormField
              control={profileForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );

  // Food preferences step content
  const renderFoodPreferencesStep = () => (
    <motion.div
      className="max-w-md w-full mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
          <Utensils className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Food Preferences</h1>
        <p className="text-muted-foreground">Tell us what you like to eat</p>
      </motion.div>

      <Form {...foodPreferencesForm}>
        <form onSubmit={foodPreferencesForm.handleSubmit(onFoodPreferencesSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <div className="space-y-2">
              <Label htmlFor="favoriteCuisines">Favorite Cuisines</Label>
              <TagInput
                id="favoriteCuisines"
                tags={cuisineTags}
                setTags={setCuisineTags}
                placeholder="Type cuisine and press Enter"
                preserveFocus={true}
              />
              <p className="text-xs text-muted-foreground">E.g., Italian, Mexican, Thai</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="space-y-2">
              <Label htmlFor="ingredientsToAvoid">Ingredients to Avoid</Label>
              <TagInput
                id="ingredientsToAvoid"
                tags={avoidTags}
                setTags={setAvoidTags}
                placeholder="Type ingredient and press Enter"
                preserveFocus={true}
              />
              <p className="text-xs text-muted-foreground">E.g., Peanuts, Shellfish, Gluten</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={foodPreferencesForm.control}
              name="dietaryNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Any other food preferences..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-2 border-t pt-4">
            <Switch
              id="babyFoodEnabled"
              checked={enableBabyFood}
              onCheckedChange={setEnableBabyFood}
            />
            <Label htmlFor="babyFoodEnabled" className="cursor-pointer">
              I want to set up Baby Food options
            </Label>
            <Baby className="h-5 w-5 text-muted-foreground" />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );

  // Baby food step content
  const renderBabyFoodStep = () => (
    <motion.div
      className="max-w-md w-full mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
          <Baby className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Baby Food</h1>
        <p className="text-muted-foreground">Setup for your little one</p>
      </motion.div>

      <Form {...babyFoodForm}>
        <form onSubmit={babyFoodForm.handleSubmit(onBabyFoodSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <FormField
              control={babyFoodForm.control}
              name="babyAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baby's Age (months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="space-y-2">
              <Label htmlFor="suitableBabyIngredients">
                Suitable Ingredients for Baby
              </Label>
              <TagInput
                id="suitableBabyIngredients"
                tags={babyIngredientTags}
                setTags={setBabyIngredientTags}
                placeholder="Type ingredient and press Enter"
                preserveFocus={true}
              />
              <p className="text-xs text-muted-foreground">
                E.g., Sweet potato, Avocado, Banana
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center space-x-2">
            <FormField
              control={babyFoodForm.control}
              name="babyLedWeaning"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Baby-Led Weaning</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Focus on finger foods instead of purees
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={babyFoodForm.control}
              name="babyFoodPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Baby Food Notes</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Any other baby food preferences..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );

  // Completion step content
  const renderCompleteStep = () => (
    <motion.div
      className="flex flex-col items-center text-center space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        variants={itemVariants} 
        className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        <Check className="h-12 w-12 text-white" />
      </motion.div>
      
      <motion.h1 variants={itemVariants} className="text-3xl font-bold">
        All Done!
      </motion.h1>
      
      <motion.p variants={itemVariants} className="text-lg max-w-md text-muted-foreground">
        Your profile is all set up and ready to go. We've personalized your 
        experience based on your preferences.
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <Button onClick={finishOnboarding} size="lg" className="mt-4">
          Go to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress indicator */}
      <div className="w-full bg-muted py-4">
        <div className="container max-w-md mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Just a few steps</span>
            </div>
            
            <div className="flex space-x-1">
              <div className={`h-2 w-8 rounded ${currentStep !== "welcome" ? "bg-primary" : "bg-muted-foreground"}`}></div>
              <div className={`h-2 w-8 rounded ${currentStep !== "welcome" && currentStep !== "profile" ? "bg-primary" : "bg-muted-foreground"}`}></div>
              <div className={`h-2 w-8 rounded ${currentStep === "complete" || (currentStep === "babyFood" && enableBabyFood) ? "bg-primary" : "bg-muted-foreground"}`}></div>
              {enableBabyFood && (
                <div className={`h-2 w-8 rounded ${currentStep === "complete" ? "bg-primary" : "bg-muted-foreground"}`}></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {currentStep === "welcome" && renderWelcomeStep()}
            {currentStep === "profile" && renderProfileStep()}
            {currentStep === "foodPreferences" && renderFoodPreferencesStep()}
            {currentStep === "babyFood" && renderBabyFoodStep()}
            {currentStep === "complete" && renderCompleteStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

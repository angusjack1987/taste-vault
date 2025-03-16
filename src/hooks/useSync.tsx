
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { Json } from "@/integrations/supabase/types";

export interface SharingPreferences {
  recipes: boolean;
  babyRecipes: boolean;
  fridgeItems: boolean;
  shoppingList: boolean;
  mealPlan: boolean;
}

interface ConnectedUser {
  id: string;
  first_name: string | null;
  share_token: string | null;
  created_at: string;
}

// Helper function to safely parse JSON preferences
const getSharingPreferences = (preferences: Json | null): SharingPreferences => {
  if (!preferences) return getDefaultSharingPreferences();
  
  if (typeof preferences === 'object' && preferences !== null && !Array.isArray(preferences)) {
    const sharing = preferences.sharing;
    
    if (sharing && typeof sharing === 'object' && !Array.isArray(sharing)) {
      return {
        recipes: !!sharing.recipes,
        babyRecipes: !!sharing.babyRecipes,
        fridgeItems: !!sharing.fridgeItems,
        shoppingList: !!sharing.shoppingList,
        mealPlan: !!sharing.mealPlan
      };
    }
  }
  
  return getDefaultSharingPreferences();
};

// Default sharing preferences
const getDefaultSharingPreferences = (): SharingPreferences => ({
  recipes: true,
  babyRecipes: true,
  fridgeItems: false,
  shoppingList: false,
  mealPlan: true
});

export const useSync = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch the current user's sharing preferences
  const fetchSharingPreferences = async (): Promise<SharingPreferences | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching sharing preferences:", error);
        throw error;
      }
      
      if (data?.preferences) {
        return getSharingPreferences(data.preferences);
      }
      
      return getDefaultSharingPreferences();
    } catch (err) {
      console.error("Error in fetchSharingPreferences:", err);
      return getDefaultSharingPreferences();
    }
  };

  // Update sharing preferences
  const updateSharingPreferences = async (sharingPrefs: SharingPreferences): Promise<SharingPreferences> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      
      // First get existing preferences
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id, preferences')
        .eq('user_id', user.id)
        .single();
      
      // Create a properly typed preferences object
      let newPreferences: Record<string, any> = {};
      
      if (existingData?.preferences && typeof existingData.preferences === 'object' && !Array.isArray(existingData.preferences)) {
        // Copy existing preferences
        newPreferences = { ...existingData.preferences as Record<string, any> };
      }
      
      // Add sharing preferences
      newPreferences.sharing = {
        recipes: sharingPrefs.recipes,
        babyRecipes: sharingPrefs.babyRecipes,
        fridgeItems: sharingPrefs.fridgeItems,
        shoppingList: sharingPrefs.shoppingList,
        mealPlan: sharingPrefs.mealPlan
      };
      
      if (existingData) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update({ preferences: newPreferences })
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert([{ 
            user_id: user.id,
            preferences: newPreferences
          }]);
        
        if (error) throw error;
      }
      
      return sharingPrefs;
    } catch (err) {
      console.error("Error in updateSharingPreferences:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch connected users
  const fetchConnectedUsers = async (): Promise<ConnectedUser[]> => {
    if (!user) return [];
    
    try {
      // Get all connections where current user is either user_id_1 or user_id_2
      const { data: connections, error } = await supabase
        .from('profile_sharing')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);
        
      if (error) throw error;
      
      if (!connections || connections.length === 0) return [];
      
      // Extract other user IDs
      const otherUserIds = connections.map(conn => 
        conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1
      );
      
      // Fetch profiles for connected users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, share_token, created_at')
        .in('id', otherUserIds);
        
      if (profilesError) throw profilesError;
      
      return profiles || [];
    } catch (err) {
      console.error("Error in fetchConnectedUsers:", err);
      return [];
    }
  };

  // Connect with another user
  const connectWithUser = async (shareToken: string): Promise<boolean> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      
      // Find user with the given token
      const { data: targetUser, error: lookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('share_token', shareToken)
        .single();

      if (lookupError || !targetUser) {
        toast.error("Invalid share token or user not found");
        return false;
      }

      // Don't allow connecting to self
      if (targetUser.id === user.id) {
        toast.error("You cannot connect with yourself");
        return false;
      }
      
      // Check if connection already exists
      const { data: existingConn, error: connCheckError } = await supabase
        .from('profile_sharing')
        .select('id')
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${targetUser.id}),and(user_id_1.eq.${targetUser.id},user_id_2.eq.${user.id})`)
        .maybeSingle();
        
      if (connCheckError) throw connCheckError;
      
      if (existingConn) {
        toast.info("You're already connected with this user");
        return true;
      }
      
      // Create a new connection
      const { error: createConnError } = await supabase
        .from('profile_sharing')
        .insert([{
          user_id_1: user.id,
          user_id_2: targetUser.id
        }]);
        
      if (createConnError) throw createConnError;
      
      // Sync data from target user
      await syncData(targetUser.id);
      
      toast.success("Successfully connected with user");
      return true;
    } catch (err) {
      console.error("Error in connectWithUser:", err);
      toast.error("Failed to connect with user");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove connection with another user
  const removeConnection = async (otherUserId: string): Promise<boolean> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('profile_sharing')
        .delete()
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${otherUserId}),and(user_id_1.eq.${otherUserId},user_id_2.eq.${user.id})`);
        
      if (error) throw error;
      
      toast.success("Connection removed successfully");
      return true;
    } catch (err) {
      console.error("Error in removeConnection:", err);
      toast.error("Failed to remove connection");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync data from another user
  const syncData = async (fromUserId: string): Promise<boolean> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      
      // Get sharing preferences of the other user
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', fromUserId)
        .single();
        
      if (prefsError && prefsError.code !== 'PGRST116') throw prefsError;
      
      // Get sharing preferences or use defaults
      const sharingPrefs = getSharingPreferences(prefsData?.preferences || null);
      
      // Sync recipes if allowed
      if (sharingPrefs.recipes) {
        await syncRecipes(fromUserId);
      }
      
      // Sync baby recipes if allowed
      if (sharingPrefs.babyRecipes) {
        await syncBabyRecipes(fromUserId);
      }
      
      // Sync fridge items if allowed
      if (sharingPrefs.fridgeItems) {
        await syncFridgeItems(fromUserId);
      }
      
      // Sync shopping list if allowed
      if (sharingPrefs.shoppingList) {
        await syncShoppingList(fromUserId);
      }
      
      // Sync meal plans if allowed
      if (sharingPrefs.mealPlan) {
        await syncMealPlans(fromUserId);
      }
      
      toast.success("Data sync completed successfully!");
      return true;
    } catch (err) {
      console.error("Error in syncData:", err);
      toast.error("Failed to sync data");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to sync recipes
  const syncRecipes = async (fromUserId: string): Promise<void> => {
    // Get recipes from other user
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!recipes || recipes.length === 0) return;
    
    // For each recipe, check if we already have it (by title) and add if not
    for (const recipe of recipes) {
      const { data: existingRecipe } = await supabase
        .from('recipes')
        .select('id')
        .eq('user_id', user!.id)
        .eq('title', recipe.title)
        .maybeSingle();
        
      if (!existingRecipe) {
        // Create a new recipe for current user
        const newRecipe = {
          ...recipe,
          id: undefined, // Let Supabase generate a new ID
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('recipes').insert([newRecipe]);
      }
    }
    
    // Invalidate recipes query
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
  };

  // Helper function to sync baby recipes
  const syncBabyRecipes = async (fromUserId: string): Promise<void> => {
    // Get baby recipes from other user
    const { data: babyRecipes, error } = await supabase
      .from('baby_food_recipes')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!babyRecipes || babyRecipes.length === 0) return;
    
    // For each recipe, check if we already have it (by title) and add if not
    for (const recipe of babyRecipes) {
      const { data: existingRecipe } = await supabase
        .from('baby_food_recipes')
        .select('id')
        .eq('user_id', user!.id)
        .eq('title', recipe.title)
        .maybeSingle();
        
      if (!existingRecipe) {
        // Create a new recipe for current user
        const newRecipe = {
          ...recipe,
          id: undefined, // Let Supabase generate a new ID
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('baby_food_recipes').insert([newRecipe]);
      }
    }
    
    // Also sync baby profiles if available
    const { data: babyProfiles, error: profilesError } = await supabase
      .from('baby_profiles')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (!profilesError && babyProfiles && babyProfiles.length > 0) {
      for (const profile of babyProfiles) {
        const { data: existingProfile } = await supabase
          .from('baby_profiles')
          .select('id')
          .eq('user_id', user!.id)
          .eq('name', profile.name)
          .maybeSingle();
          
        if (!existingProfile) {
          const newProfile = {
            ...profile,
            id: undefined,
            user_id: user!.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          await supabase.from('baby_profiles').insert([newProfile]);
        }
      }
    }
  };

  // Helper function to sync fridge items
  const syncFridgeItems = async (fromUserId: string): Promise<void> => {
    // Get fridge items from other user
    const { data: fridgeItems, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!fridgeItems || fridgeItems.length === 0) return;
    
    // For each item, check if we already have it (by name) and add if not
    for (const item of fridgeItems) {
      const { data: existingItem } = await supabase
        .from('fridge_items')
        .select('id')
        .eq('user_id', user!.id)
        .eq('name', item.name)
        .maybeSingle();
        
      if (!existingItem) {
        // Create a new item for current user
        const newItem = {
          ...item,
          id: undefined, // Let Supabase generate a new ID
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('fridge_items').insert([newItem]);
      }
    }
    
    // Invalidate fridge items query
    queryClient.invalidateQueries({ queryKey: ['fridge-items'] });
  };

  // Helper function to sync shopping list items
  const syncShoppingList = async (fromUserId: string): Promise<void> => {
    // Get shopping list items from other user
    const { data: shoppingItems, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!shoppingItems || shoppingItems.length === 0) return;
    
    // For each item, check if we already have it (by ingredient) and add if not
    for (const item of shoppingItems) {
      const { data: existingItem } = await supabase
        .from('shopping_list')
        .select('id')
        .eq('user_id', user!.id)
        .eq('ingredient', item.ingredient)
        .maybeSingle();
        
      if (!existingItem) {
        // Create a new item for current user
        const newItem = {
          ...item,
          id: undefined, // Let Supabase generate a new ID
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('shopping_list').insert([newItem]);
      }
    }
    
    // Invalidate shopping list query
    queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  // Helper function to sync meal plans
  const syncMealPlans = async (fromUserId: string): Promise<void> => {
    // Get meal plans from other user
    const { data: mealPlans, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!mealPlans || mealPlans.length === 0) return;
    
    // For each plan, check if we already have one for that date/meal_type and add if not
    for (const plan of mealPlans) {
      const { data: existingPlan } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user!.id)
        .eq('date', plan.date)
        .eq('meal_type', plan.meal_type)
        .maybeSingle();
        
      if (!existingPlan) {
        // Create a new plan for current user
        const newPlan = {
          ...plan,
          id: undefined, // Let Supabase generate a new ID
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('meal_plans').insert([newPlan]);
      }
    }
    
    // Invalidate meal plans query
    queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
  };

  // React Query hooks
  const useSharingPreferencesQuery = () => {
    return useQuery({
      queryKey: ['sharing-preferences'],
      queryFn: fetchSharingPreferences,
      enabled: !!user,
    });
  };
  
  const useConnectedUsersQuery = () => {
    return useQuery({
      queryKey: ['connected-users'],
      queryFn: fetchConnectedUsers,
      enabled: !!user,
    });
  };

  const useUpdateSharingPreferences = () => {
    return useMutation({
      mutationFn: updateSharingPreferences,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sharing-preferences'] });
      },
    });
  };

  const useConnectWithUser = () => {
    return useMutation({
      mutationFn: connectWithUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connected-users'] });
      },
    });
  };

  const useRemoveConnection = () => {
    return useMutation({
      mutationFn: removeConnection,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connected-users'] });
      },
    });
  };

  const useSyncData = () => {
    return useMutation({
      mutationFn: syncData,
    });
  };
  
  return {
    isProcessing,
    useSharingPreferencesQuery,
    useConnectedUsersQuery,
    useUpdateSharingPreferences,
    useConnectWithUser,
    useRemoveConnection,
    useSyncData,
  };
};

export default useSync;

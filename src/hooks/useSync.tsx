
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

const getSharingPreferences = (preferences: Json | null): SharingPreferences => {
  if (!preferences) return getDefaultSharingPreferences();
  
  if (typeof preferences === 'object' && preferences !== null && !Array.isArray(preferences)) {
    const prefsObject = preferences as Record<string, Json>;
    const sharing = prefsObject.sharing;
    
    if (sharing && typeof sharing === 'object' && !Array.isArray(sharing)) {
      const sharingObj = sharing as Record<string, Json>;
      return {
        recipes: Boolean(sharingObj.recipes),
        babyRecipes: Boolean(sharingObj.babyRecipes),
        fridgeItems: Boolean(sharingObj.fridgeItems),
        shoppingList: Boolean(sharingObj.shoppingList),
        mealPlan: Boolean(sharingObj.mealPlan)
      };
    }
  }
  
  return getDefaultSharingPreferences();
};

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

  const fetchSharingPreferences = async (): Promise<SharingPreferences | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
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

  const updateSharingPreferences = async (sharingPrefs: SharingPreferences): Promise<SharingPreferences> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id, preferences')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let newPreferences: Record<string, any> = {};
      
      if (existingData?.preferences && typeof existingData.preferences === 'object' && !Array.isArray(existingData.preferences)) {
        const existingPrefs = existingData.preferences as Record<string, any>;
        
        Object.keys(existingPrefs).forEach(key => {
          newPreferences[key] = existingPrefs[key];
        });
      }
      
      newPreferences = {
        ...newPreferences,
        sharing: {
          recipes: sharingPrefs.recipes,
          babyRecipes: sharingPrefs.babyRecipes,
          fridgeItems: sharingPrefs.fridgeItems,
          shoppingList: sharingPrefs.shoppingList,
          mealPlan: sharingPrefs.mealPlan
        }
      };
      
      if (existingData) {
        const { error } = await supabase
          .from('user_preferences')
          .update({ preferences: newPreferences as Json })
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            preferences: newPreferences as Json
          });
        
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

  const fetchConnectedUsers = async (): Promise<ConnectedUser[]> => {
    if (!user) return [];
    
    try {
      console.log("Fetching connections for user:", user.id);
      
      const { data: connections, error } = await supabase
        .from('profile_sharing')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);
        
      if (error) {
        console.error("Error fetching connections:", error);
        throw error;
      }
      
      console.log("Fetched connections:", connections);
      
      if (!connections || connections.length === 0) return [];
      
      const otherUserIds = connections.map(conn => 
        conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1
      );
      
      console.log("Found connected user IDs:", otherUserIds);
      
      if (otherUserIds.length === 0) return [];
      
      // Check if profiles exist with matching IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_url, created_at')
        .in('id', otherUserIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Fetched connected profiles:", profiles);
      
      // Use profile data if available, otherwise create placeholder profiles for connected users
      if (profiles && profiles.length > 0) {
        return profiles.map(profile => ({
          id: profile.id,
          first_name: profile.first_name || 'Unknown User',
          share_token: null,
          created_at: profile.created_at
        }));
      } else {
        // Create placeholder profiles for connected users if no profile data is found
        return otherUserIds.map(id => ({
          id,
          first_name: 'Connected User',
          share_token: null,
          created_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error("Error in fetchConnectedUsers:", err);
      return [];
    }
  };

  const connectWithUser = async (shareToken: string): Promise<boolean> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      
      const cleanToken = shareToken.trim();
      console.log("Attempting to connect with token:", cleanToken);
      
      if (!cleanToken) {
        console.error("Empty share token provided");
        toast.error("Please enter a valid share token");
        return false;
      }
      
      const { data: currentUserToken } = await supabase
        .from('share_tokens')
        .select('token')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (currentUserToken?.token === cleanToken) {
        console.error("Cannot connect with your own token");
        toast.error("You cannot connect with yourself");
        return false;
      }
      
      const { data: tokenData, error: tokenError } = await supabase
        .from('share_tokens')
        .select('user_id')
        .eq('token', cleanToken)
        .maybeSingle();
      
      console.log("Token lookup result:", tokenData, tokenError);

      if (tokenError) {
        console.error("Error looking up token:", tokenError);
        toast.error("Error looking up token: " + tokenError.message);
        return false;
      }
      
      if (!tokenData || !tokenData.user_id) {
        console.error("No user found with the provided token");
        toast.error("Invalid share token. No user found with this token.");
        return false;
      }

      const targetUserId = tokenData.user_id;
      
      const { data: targetUser, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name')
        .eq('id', targetUserId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching target user profile:", profileError);
      }

      if (targetUserId === user.id) {
        toast.error("You cannot connect with yourself");
        return false;
      }
      
      const { data: existingConn, error: connCheckError } = await supabase
        .from('profile_sharing')
        .select('id')
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${user.id})`)
        .maybeSingle();
      
      if (connCheckError) {
        console.error("Error checking existing connection:", connCheckError);
        toast.error("Error checking connection: " + connCheckError.message);
        return false;
      }
      
      if (existingConn) {
        console.log("Connection already exists:", existingConn);
        toast.info("You're already connected with this user");
        return true;
      }
      
      const newConnection = {
        user_id_1: user.id,
        user_id_2: targetUserId
      };
      
      const { data, error: createConnError } = await supabase
        .from('profile_sharing')
        .insert(newConnection)
        .select('id')
        .single();
        
      if (createConnError) {
        console.error("Error creating connection:", createConnError);
        toast.error("Error creating connection: " + createConnError.message);
        return false;
      }
      
      console.log("Successfully created connection:", data);
      
      // After creating the connection, try to sync data
      await syncData(targetUserId);
      
      const firstName = targetUser?.first_name || 'user';
      toast.success(`Successfully connected with ${firstName}`);
      queryClient.invalidateQueries({ queryKey: ['connected-users'] });
      return true;
    } catch (err) {
      console.error("Error in connectWithUser:", err);
      toast.error("Failed to connect with user: " + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

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

  const syncData = async (fromUserId: string): Promise<boolean> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      setIsProcessing(true);
      console.log(`Starting data sync from user ${fromUserId} to ${user.id}`);
      
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', fromUserId)
        .maybeSingle();
        
      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error("Error fetching preferences:", prefsError);
        throw prefsError;
      }
      
      const sharingPrefs = getSharingPreferences(prefsData?.preferences || null);
      console.log("Sharing preferences:", sharingPrefs);
      
      // Create an array of promises for each syncing operation
      const syncPromises = [];
      
      if (sharingPrefs.recipes) {
        syncPromises.push(syncRecipes(fromUserId));
      }
      
      if (sharingPrefs.babyRecipes) {
        syncPromises.push(syncBabyRecipes(fromUserId));
      }
      
      if (sharingPrefs.fridgeItems) {
        syncPromises.push(syncFridgeItems(fromUserId));
      }
      
      if (sharingPrefs.shoppingList) {
        syncPromises.push(syncShoppingList(fromUserId));
      }
      
      if (sharingPrefs.mealPlan) {
        syncPromises.push(syncMealPlans(fromUserId));
      }
      
      // Wait for all promises to complete, even if some fail
      const results = await Promise.allSettled(syncPromises);
      
      // Check if any operations failed
      const failedOperations = results.filter(r => r.status === 'rejected');
      if (failedOperations.length > 0) {
        console.error("Some sync operations failed:", failedOperations);
        if (failedOperations.length === syncPromises.length) {
          // All operations failed
          toast.error("Data sync failed. Please try again.");
          return false;
        } else {
          // Some operations failed, but not all
          toast.warning("Some data couldn't be synced. Try again later.");
        }
      } else {
        toast.success("Data sync completed successfully!");
      }
      
      return true;
    } catch (err) {
      console.error("Error in syncData:", err);
      toast.error("Failed to sync data: " + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const syncRecipes = async (fromUserId: string): Promise<void> => {
    console.log(`Syncing recipes from user ${fromUserId}`);
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', fromUserId);
        
      if (error) {
        console.error("Error fetching recipes:", error);
        throw error;
      }
      
      console.log(`Found ${recipes?.length || 0} recipes to sync`);
      
      if (!recipes || recipes.length === 0) return;
      
      let syncedCount = 0;
      
      for (const recipe of recipes) {
        const { data: existingRecipe } = await supabase
          .from('recipes')
          .select('id')
          .eq('user_id', user!.id)
          .eq('title', recipe.title)
          .maybeSingle();
          
        if (!existingRecipe) {
          const newRecipe = {
            ...recipe,
            id: undefined, // Remove id so a new one is generated
            user_id: user!.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await supabase
            .from('recipes')
            .insert([newRecipe]);
            
          if (insertError) {
            console.error(`Error syncing recipe "${recipe.title}":`, insertError);
          } else {
            syncedCount++;
          }
        }
      }
      
      console.log(`Successfully synced ${syncedCount} recipes`);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    } catch (err) {
      console.error("Error in syncRecipes:", err);
      throw err;
    }
  };

  const syncBabyRecipes = async (fromUserId: string): Promise<void> => {
    console.log(`Syncing baby recipes from user ${fromUserId}`);
    try {
      const { data: babyRecipes, error } = await supabase
        .from('baby_food_recipes')
        .select('*')
        .eq('user_id', fromUserId);
        
      if (error) {
        console.error("Error fetching baby recipes:", error);
        throw error;
      }
      
      console.log(`Found ${babyRecipes?.length || 0} baby recipes to sync`);
      
      if (!babyRecipes || babyRecipes.length === 0) return;
      
      let syncedCount = 0;
      
      for (const recipe of babyRecipes) {
        const { data: existingRecipe } = await supabase
          .from('baby_food_recipes')
          .select('id')
          .eq('user_id', user!.id)
          .eq('title', recipe.title)
          .maybeSingle();
          
        if (!existingRecipe) {
          const newRecipe = {
            ...recipe,
            id: undefined, // Remove id so a new one is generated
            user_id: user!.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await supabase
            .from('baby_food_recipes')
            .insert([newRecipe]);
            
          if (insertError) {
            console.error(`Error syncing baby recipe "${recipe.title}":`, insertError);
          } else {
            syncedCount++;
          }
        }
      }
      
      console.log(`Successfully synced ${syncedCount} baby recipes`);
      
      // Also sync baby profiles
      const { data: babyProfiles, error: profilesError } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', fromUserId);
        
      if (!profilesError && babyProfiles && babyProfiles.length > 0) {
        console.log(`Found ${babyProfiles.length} baby profiles to sync`);
        let syncedProfileCount = 0;
        
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
              id: undefined, // Remove id so a new one is generated
              user_id: user!.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            const { error: insertError } = await supabase
              .from('baby_profiles')
              .insert([newProfile]);
              
            if (insertError) {
              console.error(`Error syncing baby profile "${profile.name}":`, insertError);
            } else {
              syncedProfileCount++;
            }
          }
        }
        
        console.log(`Successfully synced ${syncedProfileCount} baby profiles`);
      }
    } catch (err) {
      console.error("Error in syncBabyRecipes:", err);
      throw err;
    }
  };

  const syncFridgeItems = async (fromUserId: string): Promise<void> => {
    const { data: fridgeItems, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!fridgeItems || fridgeItems.length === 0) return;
    
    for (const item of fridgeItems) {
      const { data: existingItem } = await supabase
        .from('fridge_items')
        .select('id')
        .eq('user_id', user!.id)
        .eq('name', item.name)
        .maybeSingle();
        
      if (!existingItem) {
        const newItem = {
          ...item,
          id: undefined,
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('fridge_items').insert([newItem]);
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['fridge-items'] });
  };

  const syncShoppingList = async (fromUserId: string): Promise<void> => {
    const { data: shoppingItems, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', fromUserId);
      
    if (error) throw error;
    
    if (!shoppingItems || shoppingItems.length === 0) return;
    
    for (const item of shoppingItems) {
      const { data: existingItem } = await supabase
        .from('shopping_list')
        .select('id')
        .eq('user_id', user!.id)
        .eq('ingredient', item.ingredient)
        .maybeSingle();
        
      if (!existingItem) {
        const newItem = {
          ...item,
          id: undefined,
          user_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabase.from('shopping_list').insert([newItem]);
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  const syncMealPlans = async (fromUserId: string): Promise<void> => {
    console.log(`Syncing meal plans from user ${fromUserId}`);
    try {
      const { data: mealPlans, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', fromUserId);
        
      if (error) {
        console.error("Error fetching meal plans:", error);
        throw error;
      }
      
      console.log(`Found ${mealPlans?.length || 0} meal plans to sync`);
      
      if (!mealPlans || mealPlans.length === 0) return;
      
      let syncedCount = 0;
      
      for (const plan of mealPlans) {
        const { data: existingPlan } = await supabase
          .from('meal_plans')
          .select('id')
          .eq('user_id', user!.id)
          .eq('date', plan.date)
          .eq('meal_type', plan.meal_type)
          .maybeSingle();
          
        if (!existingPlan) {
          const newPlan = {
            ...plan,
            id: undefined, // Remove id so a new one is generated
            user_id: user!.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await supabase
            .from('meal_plans')
            .insert([newPlan]);
            
          if (insertError) {
            console.error(`Error syncing meal plan for ${plan.date}, ${plan.meal_type}:`, insertError);
          } else {
            syncedCount++;
          }
        }
      }
      
      console.log(`Successfully synced ${syncedCount} meal plans`);
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    } catch (err) {
      console.error("Error in syncMealPlans:", err);
      throw err;
    }
  };

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
      onSuccess: (success) => {
        if (success) {
          queryClient.invalidateQueries({ queryKey: ['connected-users'] });
        }
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

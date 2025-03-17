
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import useRecipes from './useRecipes';

// Create context for sync state
interface SyncContextType {
  isSyncing: boolean;
  syncWithAllConnectedUsers: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType>({
  isSyncing: false,
  syncWithAllConnectedUsers: async () => {}
});

export const useSyncContext = () => useContext(SyncContext);

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const { useAllRecipes, useBulkUpdateRecipes } = useRecipes();
  const { data: recipes } = useAllRecipes();
  const { mutateAsync: bulkUpdateRecipes } = useBulkUpdateRecipes();
  const initialSyncDone = useRef(false);
  const lastSyncTime = useRef<number>(0);
  
  // Function to sync recipes with all connected users
  const syncWithAllConnectedUsers = async () => {
    if (!user || isSyncing) return;
    
    // Debounce syncing - only sync once every 30 seconds
    const now = Date.now();
    if (now - lastSyncTime.current < 30000) {
      console.log("Skipping sync - too soon since last sync");
      return;
    }
    
    lastSyncTime.current = now;
    
    try {
      setIsSyncing(true);
      
      // Get all the connections
      const { data: connections, error: connectionError } = await supabase
        .from('profile_sharing')
        .select('*')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);
        
      if (connectionError) {
        console.error("Error fetching connections:", connectionError);
        return;
      }
      
      if (!connections || connections.length === 0) {
        console.log("No connections found to sync with");
        return;
      }
      
      // Extract connected user IDs
      const connectedUserIds = connections.map(conn => 
        conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1
      );
      
      if (recipes && recipes.length > 0) {
        // For each connected user, check if they have these recipes
        for (const userId of connectedUserIds) {
          // Get an array of recipe titles from the connected user
          const { data: userRecipes, error: userRecipesError } = await supabase
            .from('recipes')
            .select('id, title, updated_at')
            .eq('user_id', userId);
            
          if (userRecipesError) {
            console.error(`Error fetching recipes for user ${userId}:`, userRecipesError);
            continue;
          }
          
          // Skip user if they have no recipes
          if (!userRecipes || userRecipes.length === 0) continue;
          
          // Check if any recipes need to be shared
          for (const recipe of recipes) {
            // Check if user already has this recipe by title (case insensitive)
            const existingRecipe = userRecipes.find(
              r => r.title.toLowerCase().trim() === recipe.title.toLowerCase().trim()
            );
            
            if (!existingRecipe) {
              // Create a new recipe for the user
              const { error: insertError } = await supabase
                .from('recipes')
                .insert([{
                  ...recipe,
                  id: undefined, // Generate new ID
                  user_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }]);
                
              if (insertError) {
                console.error(`Error sharing recipe with user ${userId}:`, insertError);
              }
            }
          }
        }
      }
      
      // Get recipes from connected users to check for updates
      for (const userId of connectedUserIds) {
        // Get recipes from each connected user
        const { data: userRecipes, error: userRecipesError } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', userId);
          
        if (userRecipesError) {
          console.error(`Error fetching recipes for user ${userId}:`, userRecipesError);
          continue;
        }
        
        if (!userRecipes || userRecipes.length === 0) continue;
        
        // Check for deleted recipes by retrieving the deleted recipes list from localStorage
        const storageKey = `deleted_recipes_${user.id}`;
        const deletedRecipeIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Only get recipes that are not already deleted locally
        const newRecipes = userRecipes.filter(userRecipe => {
          // Skip recipes that have been deleted by current user
          if (deletedRecipeIds.includes(userRecipe.id)) {
            return false;
          }
          
          // Check if current user already has this recipe by title
          const existingRecipe = recipes?.find(
            r => r.title.toLowerCase().trim() === userRecipe.title.toLowerCase().trim()
          );
          
          // If recipe doesn't exist, include it
          if (!existingRecipe) return true;
          
          // If recipe exists but this one is newer, take the newer one
          return new Date(userRecipe.updated_at) > new Date(existingRecipe.updated_at);
        });
        
        if (newRecipes.length > 0) {
          // Add these recipes for the current user
          for (const recipe of newRecipes) {
            const { error: insertError } = await supabase
              .from('recipes')
              .insert([{
                ...recipe,
                id: undefined, // Generate new ID
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
              
            if (insertError) {
              console.error(`Error adding recipe from user ${userId}:`, insertError);
            }
          }
        }
      }
      
      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Error during sync:", error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Perform an initial sync when the component mounts
  useEffect(() => {
    if (user && recipes && !initialSyncDone.current) {
      initialSyncDone.current = true;
      syncWithAllConnectedUsers();
    }
  }, [user, recipes]);
  
  return (
    <SyncContext.Provider value={{ isSyncing, syncWithAllConnectedUsers }}>
      {children}
    </SyncContext.Provider>
  );
};

// Create a hook to use the sync context
const useSync = () => {
  const context = useContext(SyncContext);
  
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  
  return context;
};

export default useSync;

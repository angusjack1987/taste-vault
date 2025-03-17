
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase, handleSupabaseRequest } from "@/integrations/supabase/client";
import useAuth from "./useAuth";
import useAISettings from "./useAISettings";
import { marked } from "marked";

// Local storage keys
const MEMORY_INSIGHTS_KEY = "flavor-librarian-memory-insights";
const MEMORY_TIMESTAMP_KEY = "flavor-librarian-memory-timestamp";

// Define types for our RPC functions' responses
interface MemoryInsight {
  insights: string;
  created_at: string;
}

export const useAiMemory = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { user, refreshSession } = useAuth();
  const { useAISettingsQuery } = useAISettings();
  const { data: aiSettings } = useAISettingsQuery();

  // Load insights from Supabase first, then fallback to local storage
  useEffect(() => {
    if (user) {
      fetchStoredInsights();
    }
  }, [user]);

  // Fetch stored insights from Supabase
  const fetchStoredInsights = async () => {
    if (!user) return;

    try {
      // Use the get_latest_memory_insights RPC function
      const insightsData = await handleSupabaseRequest(
        async () => {
          return await supabase.rpc('get_latest_memory_insights', { 
            user_id_param: user.id 
          });
        },
        "Error fetching memory insights"
      );

      if (insightsData && insightsData.length > 0) {
        // We found insights in the database, use these
        const parsedInsights = parseMarkdownToHtml(insightsData[0].insights);
        setInsights(parsedInsights);
        setLastUpdated(insightsData[0].created_at);
        
        // Also update local storage for quick access
        const storageKey = `${MEMORY_INSIGHTS_KEY}-${user.id}`;
        const timestampKey = `${MEMORY_TIMESTAMP_KEY}-${user.id}`;
        localStorage.setItem(storageKey, parsedInsights);
        localStorage.setItem(timestampKey, insightsData[0].created_at);
        return;
      }
      
      // Fallback to local storage if no database record found
      fallbackToLocalStorage();
    } catch (err) {
      console.error("Error fetching stored insights:", err);
      
      // If we get a 401/403, try refreshing the session
      if (user) {
        refreshSession();
      }
      
      // Fallback to local storage
      fallbackToLocalStorage();
    }
  };

  // Helper function to get data from local storage
  const fallbackToLocalStorage = () => {
    if (!user) return;
    
    const storageKey = `${MEMORY_INSIGHTS_KEY}-${user.id}`;
    const timestampKey = `${MEMORY_TIMESTAMP_KEY}-${user.id}`;
    
    const storedInsights = localStorage.getItem(storageKey);
    const storedTimestamp = localStorage.getItem(timestampKey);
    
    if (storedInsights) {
      setInsights(storedInsights);
    }
    
    if (storedTimestamp) {
      setLastUpdated(storedTimestamp);
    }
  };

  const getMemoryInsights = async () => {
    if (!user) {
      toast.error("You must be logged in to get personalized insights");
      return null;
    }

    setLoading(true);

    try {
      const functionResponse = await handleSupabaseRequest(
        async () => {
          return await supabase.functions.invoke(
            "ai-memory-insights",
            {
              body: {
                userId: user.id,
                aiSettings: {
                  model: aiSettings?.model || "gpt-4o-mini",
                  temperature: aiSettings?.temperature || 0.7,
                  useMemory: aiSettings?.useMemory ?? true,
                },
              },
            }
          );
        },
        "Failed to get AI insights"
      );

      if (!functionResponse) {
        return null;
      }

      // Parse markdown to HTML
      const rawInsights = functionResponse.insights;
      const parsedInsights = parseMarkdownToHtml(rawInsights);
      
      setInsights(parsedInsights);
      
      // Store in local storage with timestamp
      const now = new Date().toISOString();
      setLastUpdated(now);
      
      if (user) {
        const storageKey = `${MEMORY_INSIGHTS_KEY}-${user.id}`;
        const timestampKey = `${MEMORY_TIMESTAMP_KEY}-${user.id}`;
        
        localStorage.setItem(storageKey, parsedInsights);
        localStorage.setItem(timestampKey, now);
        
        // Also store in Supabase for persistence
        await storeInsightsInSupabase(rawInsights);
      }
      
      return parsedInsights;
    } catch (error) {
      console.error("Unexpected error in AI memory insights:", error);
      toast.error("Failed to get AI insights. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Store insights in Supabase database using the RPC function
  const storeInsightsInSupabase = async (rawInsights: string) => {
    if (!user) return;
    
    try {
      await handleSupabaseRequest(
        async () => {
          return await supabase.rpc(
            'store_memory_insights',
            { 
              user_id_param: user.id, 
              insights_param: rawInsights,
              created_at_param: new Date().toISOString()
            }
          );
        },
        "Error storing memory insights"
      );
    } catch (err) {
      console.error("Failed to persist insights to database:", err);
    }
  };

  // Parse markdown to HTML
  const parseMarkdownToHtml = (markdown: string): string => {
    try {
      return marked(markdown);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return markdown;
    }
  };

  return {
    loading,
    insights,
    lastUpdated,
    getMemoryInsights,
    isMemoryEnabled: aiSettings?.useMemory ?? true,
  };
};

export default useAiMemory;

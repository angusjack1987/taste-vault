import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();
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
      // Use a type assertion to bypass TypeScript's type checking for the RPC call
      const { data, error } = await (supabase.rpc as any)('get_latest_memory_insights', { 
        user_id_param: user.id 
      });

      if (error) {
        console.error("Error fetching from RPC:", error);
        throw error;
      }

      if (data && data.length > 0) {
        // We found insights in the database, use these
        const parsedInsights = parseMarkdownToHtml(data[0].insights);
        setInsights(parsedInsights);
        setLastUpdated(data[0].created_at);
        
        // Also update local storage for quick access
        const storageKey = `${MEMORY_INSIGHTS_KEY}-${user.id}`;
        const timestampKey = `${MEMORY_TIMESTAMP_KEY}-${user.id}`;
        localStorage.setItem(storageKey, parsedInsights);
        localStorage.setItem(timestampKey, data[0].created_at);
        return;
      }
      
      // Fallback to local storage if no database record found
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
    } catch (err) {
      console.error("Error fetching stored insights:", err);
      
      // Fallback to local storage if there's an error
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
    }
  };

  const getMemoryInsights = async () => {
    if (!user) {
      toast.error("You must be logged in to get personalized insights");
      return null;
    }

    setLoading(true);

    try {
      const { data: response, error } = await supabase.functions.invoke(
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

      if (error) {
        console.error("Error getting AI memory insights:", error);
        toast.error("Failed to get AI insights");
        throw error;
      }

      // Parse markdown to HTML
      const rawInsights = response.insights;
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

  // Store insights in Supabase database using a raw query to avoid TypeScript errors
  const storeInsightsInSupabase = async (rawInsights: string) => {
    if (!user) return;
    
    try {
      // Use a type assertion to bypass TypeScript's type checking for the RPC call
      const { error } = await (supabase.rpc as any)(
        'store_memory_insights',
        { 
          user_id_param: user.id, 
          insights_param: rawInsights,
          created_at_param: new Date().toISOString()
        }
      );
        
      if (error) {
        console.error("Error storing insights in database:", error);
      }
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

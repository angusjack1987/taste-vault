
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";
import useAISettings from "./useAISettings";
import { marked } from "marked";

// Local storage keys
const MEMORY_INSIGHTS_KEY = "flavor-librarian-memory-insights";
const MEMORY_TIMESTAMP_KEY = "flavor-librarian-memory-timestamp";

export const useAiMemory = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { user } = useAuth();
  const { useAISettingsQuery } = useAISettings();
  const { data: aiSettings } = useAISettingsQuery();

  // Load insights from local storage on initial load
  useEffect(() => {
    if (user) {
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
  }, [user]);

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

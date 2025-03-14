
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";
import useAISettings from "./useAISettings";

export const useAiMemory = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const { user } = useAuth();
  const { useAISettingsQuery } = useAISettings();
  const { data: aiSettings } = useAISettingsQuery();

  const getMemoryInsights = async () => {
    if (!user) {
      toast.error("You must be logged in to get personalized insights");
      return null;
    }

    setLoading(true);
    setInsights(null);

    try {
      const { data: response, error } = await supabase.functions.invoke(
        "ai-memory-insights",
        {
          body: {
            userId: user.id,
            aiSettings: {
              model: aiSettings?.model || "gpt-4o-mini",
              temperature: aiSettings?.temperature || 0.7,
            },
          },
        }
      );

      if (error) {
        console.error("Error getting AI memory insights:", error);
        toast.error("Failed to get AI insights");
        throw error;
      }

      setInsights(response.insights);
      return response.insights;
    } catch (error) {
      console.error("Unexpected error in AI memory insights:", error);
      toast.error("Failed to get AI insights. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    insights,
    getMemoryInsights,
  };
};

export default useAiMemory;

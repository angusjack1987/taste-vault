
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

const SUPABASE_URL = "https://ylqhmufqrrprgklflgiw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscWhtdWZxcnJwcmdrbGZsZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzE1MzUsImV4cCI6MjA1NzM0NzUzNX0.DpeIbCZW5QOrOl62u-X56EbAnZChd6yqDzaiJM-FJso";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Utility function to handle Supabase requests with error handling
 * @param requestFn - Async function that executes the Supabase request and returns {data, error}
 * @param errorMessage - Custom error message to show in toast if the request fails
 * @returns The data from the request or null if it fails
 */
export const handleSupabaseRequest = async <T>(
  requestFn: () => Promise<{ data: T; error: any }>,
  errorMessage: string = "An error occurred"
): Promise<T | null> => {
  try {
    const { data, error } = await requestFn();
    
    if (error) {
      console.error(`Supabase error: ${errorMessage}`, error);
      toast.error(errorMessage);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Unexpected error: ${errorMessage}`, err);
    toast.error(errorMessage);
    return null;
  }
};

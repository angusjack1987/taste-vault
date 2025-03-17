
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

// Use environment variables when available, fallback to hardcoded values for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ylqhmufqrrprgklflgiw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscWhtdWZxcnJwcmdrbGZsZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzE1MzUsImV4cCI6MjA1NzM0NzUzNX0.DpeIbCZW5QOrOl62u-X56EbAnZChd6yqDzaiJM-FJso";

// Create a more robust client with better error handling
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
      },
    },
    // Add timeout to avoid hanging requests
    realtime: {
      timeout: 10000,
    },
  }
);

// Extend the supabase functions object with a more robust invoke method
const originalInvoke = supabase.functions.invoke;
supabase.functions.invoke = async function(
  functionName: string,
  options?: { body?: unknown } & { headers?: Record<string, string> }
) {
  try {
    console.log(`Invoking edge function: ${functionName}`);
    
    // Check for network connectivity
    if (!navigator.onLine) {
      console.error("Network is offline");
      return { data: null, error: { message: "You are offline. Please check your internet connection." } };
    }
    
    const response = await originalInvoke.call(this, functionName, {
      ...options,
      headers: {
        ...options?.headers,
        'Cache-Control': 'no-cache',
      }
    });
    
    if (response.error) {
      console.error(`Edge function ${functionName} error:`, response.error);
    }
    
    return response;
  } catch (error) {
    console.error(`Unexpected error in edge function ${functionName}:`, error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : "Failed to call edge function" 
      } 
    };
  }
};

// Helper function to handle common Supabase errors
export async function handleSupabaseRequest<T>(
  requestFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string = "An error occurred"
): Promise<T | null> {
  try {
    const { data, error } = await requestFn();

    if (error) {
      console.error(`Supabase error:`, error);
      if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
        // Auth error - session might be invalid
        toast.error("Your session has expired. Please log in again.");
        supabase.auth.signOut();
        return null;
      }
      
      // Network error handling
      if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
        toast.error("Network error. Please check your connection and try again.");
        return null;
      }
      
      toast.error(errorMessage);
      return null;
    }

    return data;
  } catch (e) {
    console.error(`Unexpected error:`, e);
    toast.error(errorMessage);
    return null;
  }
}

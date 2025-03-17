
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

// Use environment variables when available, fallback to hardcoded values for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ylqhmufqrrprgklflgiw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscWhtdWZxcnJwcmdrbGZsZ2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzE1MzUsImV4cCI6MjA1NzM0NzUzNX0.DpeIbCZW5QOrOl62u-X56EbAnZChd6yqDzaiJM-FJso";

// Create a more robust client with better error handling and network resilience
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
    // Add reasonable timeouts to avoid hanging
    realtime: {
      timeout: 10000,
    },
  }
);

// Enhanced Supabase functions invoke method with better error handling and retries
const originalInvoke = supabase.functions.invoke;

supabase.functions.invoke = async function(
  functionName: string,
  options?: { body?: unknown; headers?: Record<string, string> }
) {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`Invoking edge function: ${functionName} (attempts left: ${retries})`);
      
      // Check network connectivity first
      if (!navigator.onLine) {
        console.error("Network is offline");
        throw new Error("You are offline. Please check your internet connection.");
      }
      
      // Set a reasonable timeout for the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await originalInvoke.call(this, functionName, {
        ...options,
        headers: {
          ...options?.headers,
          'Cache-Control': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.error) {
        console.error(`Edge function ${functionName} error:`, response.error);
        
        // For certain errors, we might want to retry
        if (response.error.message?.includes('Failed to fetch') || 
            response.error.message?.includes('NetworkError') ||
            response.error.status >= 500) {
          throw new Error(`Network or server error: ${response.error.message}`);
        }
        
        // For authentication errors, we don't retry
        if (response.error.status === 401 || response.error.status === 403) {
          return { data: null, error: { message: "Authentication error. Please sign in again." } };
        }
        
        // For rate limiting, we don't retry
        if (response.error.status === 429) {
          return { data: null, error: { message: "Too many requests. Please try again later." } };
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Error in edge function ${functionName}:`, error);
      retries--;
      
      // Check if this is an AbortError (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        console.log(`Request to ${functionName} timed out. Retries left: ${retries}`);
        if (retries === 0) {
          return { 
            data: null, 
            error: { 
              message: "Request timed out. Please try again later." 
            } 
          };
        }
      }
      
      // If we have retries left, wait a bit before retrying
      if (retries > 0) {
        console.log(`Retrying ${functionName} in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        return { 
          data: null, 
          error: { 
            message: error instanceof Error ? error.message : "Failed to call edge function" 
          } 
        };
      }
    }
  }
  
  // This should not be reached due to the returns in the loop, but TypeScript wants it
  return { 
    data: null, 
    error: { 
      message: "Failed after multiple attempts" 
    } 
  };
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

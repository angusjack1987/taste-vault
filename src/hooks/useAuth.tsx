
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to initialize auth state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      console.log("Initializing auth state");
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error during initialization:", error);
        toast.error("Authentication error. Please try logging in again.");
        return;
      }
      
      console.log("Session retrieved:", session ? "Valid session" : "No session");
      
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        console.log(`Session expires at: ${expiresAt.toLocaleString()}, Current time: ${now.toLocaleString()}`);
        
        if (expiresAt <= now) {
          console.log("Session has expired, attempting refresh");
          await refreshSession();
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
    } catch (err) {
      console.error("Unexpected error during auth initialization:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_OUT') {
          toast.info("You have been signed out");
        } else if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Auth token refreshed successfully");
        } else if (event === 'USER_UPDATED') {
          toast.success("Your profile has been updated");
        }
      }
    );
    
    // Cleanup
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Error signing out");
      } else {
        console.log("Successfully signed out");
      }
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast.error("An unexpected error occurred during sign out");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to manually refresh the session token
  const refreshSession = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      console.log("Attempting to refresh session");
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        if (error.message?.includes("token is expired")) {
          console.log("Token expired, user needs to sign in again");
          // Clear the session to force sign out
          setSession(null);
          setUser(null);
        }
        return;
      }
      
      if (data.session) {
        console.log("Session refreshed successfully, expires at:", 
          new Date(data.session.expires_at! * 1000).toLocaleString());
        setSession(data.session);
        setUser(data.session.user);
      } else {
        console.log("No session returned after refresh");
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Unexpected error refreshing session:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;

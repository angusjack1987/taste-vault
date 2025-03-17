
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online");
    const handleOffline = () => setNetworkStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Set initial status
    setNetworkStatus(navigator.onLine ? "online" : "offline");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Test connection to Supabase
  const testConnection = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('ai_prompt_history').select('id').limit(1);
      
      if (error) {
        console.error("Supabase connection test error:", error);
        toast({
          title: "Connection Issue",
          description: "Could not connect to Supabase. Please check your internet connection."
        });
      } else {
        toast({
          title: "Connection Successful",
          description: "Connected to Supabase successfully."
        });
      }
    } catch (err) {
      console.error("Unexpected error during connection test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    // Check network status first
    if (networkStatus === "offline") {
      setAuthError("You are offline. Please check your internet connection and try again.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      console.log("Login successful, user data:", data.user ? "User exists" : "No user data");
      
      if (!data.user) {
        throw new Error("No user data returned");
      }

      try {
        console.log("Checking user preferences...");
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (preferencesError && preferencesError.code !== 'PGRST116') {
          console.warn("Error checking user preferences:", preferencesError);
        }

        const isNewUser = !preferences;
        console.log("Is new user:", isNewUser);
        
        if (isNewUser) {
          navigate("/onboarding");
        } else {
          const returnUrl = location.state && (location.state as any).returnUrl || "/";
          navigate(returnUrl);
        }
      } catch (preferencesCheckError) {
        // If we can't check preferences, still allow login
        console.error("Error checking preferences:", preferencesCheckError);
        const returnUrl = location.state && (location.state as any).returnUrl || "/";
        navigate(returnUrl);
      }
      
      toast({
        title: "Success",
        description: "Successfully logged in"
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more user-friendly error messages
      if (error.message === "Failed to fetch" || error.message?.includes("fetch")) {
        setAuthError("Unable to connect to the server. Please check your internet connection and try again.");
      } else if (error.message?.includes("AuthRetryableFetchError")) {
        setAuthError("Network error during authentication. Please try again in a few moments.");
      } else if (error.message?.includes("Invalid login credentials")) {
        setAuthError("Invalid email or password. Please try again.");
      } else if (error.message?.includes("Email not confirmed")) {
        setAuthError("Please confirm your email address before logging in.");
      } else {
        setAuthError(error.message || "Failed to login. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sage-100 to-cream-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Welcome Back!</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your delicious recipes</p>
          
          {networkStatus === "offline" && (
            <div className="mt-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
              You are currently offline. Please check your internet connection.
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {authError && (
            <div className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-md">
              {authError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full group"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="flex justify-between text-sm">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={testConnection}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Test Connection
            </Button>
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

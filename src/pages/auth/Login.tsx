import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      const isNewUser = !preferences;
      
      if (isNewUser) {
        navigate("/onboarding");
      } else {
        const returnUrl = location.state?.returnUrl || "/";
        navigate(returnUrl);
      }
      
      toast.success("Successfully logged in");
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to login");
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

          <Button
            type="submit"
            className="w-full group"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="text-center text-sm">
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

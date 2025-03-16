import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract returnUrl from location state if it exists
  const returnUrl = location.state?.returnUrl || '/';
  const isConnectProfile = returnUrl.includes('/connect-profile/');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back to TasteVault!",
      });
      
      console.log("Login successful, navigating to:", returnUrl);
      navigate(returnUrl);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            {isConnectProfile 
              ? "Log in to connect with a shared profile" 
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          <Button disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? "Logging in..." : "Sign in"}
          </Button>
        </CardContent>
        <div className="p-6 pt-0 text-center">
          <Link to="/auth/register" className="text-sm text-muted-foreground hover:text-primary">
            Don't have an account? Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;

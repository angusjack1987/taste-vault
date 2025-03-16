
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const AuthGuard = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = false
}: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        // Check if user has preferences set, which indicates completed onboarding
        const { data, error } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error checking onboarding status:", error);
        }
        
        setHasCompletedOnboarding(!!data);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasCompletedOnboarding(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (user) {
      checkOnboarding();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !checkingOnboarding) {
      const isAuthenticated = !!user;
      const isOnboardingRoute = location.pathname === '/onboarding';
      
      if (requireAuth && !isAuthenticated) {
        // User needs to be logged in but isn't
        navigate("/auth/login", { 
          state: { returnUrl: location.pathname } 
        });
      } else if (!requireAuth && isAuthenticated) {
        // User is logged in but the page is only for non-authenticated users
        navigate("/");
      } else if (isAuthenticated && !isOnboardingRoute && hasCompletedOnboarding === false && 
                location.pathname !== '/auth/login' && location.pathname !== '/auth/register') {
        // User is authenticated but hasn't completed onboarding and isn't on the onboarding or auth pages
        navigate("/onboarding");
      } else if (isAuthenticated && isOnboardingRoute && hasCompletedOnboarding === true) {
        // User is on the onboarding page but has already completed onboarding
        navigate("/");
      }
    }
  }, [user, isLoading, navigate, requireAuth, location.pathname, hasCompletedOnboarding, checkingOnboarding]);

  // Show loading state while checking authentication or onboarding status
  if (isLoading || (requireAuth && user && checkingOnboarding)) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Only render children if:
  // 1. We require auth and user is authenticated (and has completed onboarding if that's required), OR
  // 2. We don't require auth and user is not authenticated
  const shouldRender = 
    (requireAuth && !!user && (!requireOnboarding || hasCompletedOnboarding !== false || location.pathname === '/onboarding')) || 
    (!requireAuth && !user);

  // If conditions aren't met, render nothing (navigation will happen via useEffect)
  if (!shouldRender && !isLoading && !checkingOnboarding) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  // If we're still here, we're good to go
  return <>{children}</>;
};

export default AuthGuard;

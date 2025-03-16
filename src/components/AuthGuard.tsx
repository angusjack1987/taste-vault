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
  
  // Check if we're in simulation mode for onboarding
  const isOnboardingRoute = location.pathname === '/onboarding';
  const isOnboardingSimulation = isOnboardingRoute && location.search.includes('simulation=true');

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
          .select('preferences')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error checking onboarding status:", error);
        }
        
        // Check if onboarding has been completed in the preferences
        let onboardingCompleted = false;
        
        if (data?.preferences && 
            typeof data.preferences === 'object' && 
            !Array.isArray(data.preferences)) {
          // Access the onboarding_completed property safely
          onboardingCompleted = 
            'onboarding_completed' in data.preferences && 
            Boolean(data.preferences.onboarding_completed);
        }
        
        setHasCompletedOnboarding(onboardingCompleted);
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
      // Allow onboarding simulation without authentication
      if (isOnboardingSimulation) {
        return;
      }
      
      const isAuthenticated = !!user;
      
      if (requireAuth && !isAuthenticated) {
        // User needs to be logged in but isn't
        navigate("/auth/login", { 
          state: { returnUrl: location.pathname + location.search } 
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
  }, [user, isLoading, navigate, requireAuth, location.pathname, location.search, hasCompletedOnboarding, checkingOnboarding, isOnboardingRoute, isOnboardingSimulation]);

  // Show loading state while checking authentication or onboarding status
  if (isLoading || (requireAuth && user && checkingOnboarding && !isOnboardingSimulation)) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Allow access to onboarding in simulation mode without authentication
  if (isOnboardingSimulation) {
    return <>{children}</>;
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

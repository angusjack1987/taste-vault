
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ 
  children, 
  requireAuth = true
}: AuthGuardProps) => {
  const { user, isLoading, refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Try to refresh the session if needed
    const checkAndRefreshAuth = async () => {
      if (!user && requireAuth && !isLoading) {
        try {
          console.log("AuthGuard: No user detected, attempting to refresh session");
          await refreshSession();
          setAuthChecked(true);
        } catch (error) {
          console.error("Failed to refresh session:", error);
          setAuthChecked(true);
        }
      } else {
        setAuthChecked(true);
      }
    };
    
    checkAndRefreshAuth();
  }, [user, isLoading, refreshSession, requireAuth]);
  
  useEffect(() => {
    if (authChecked && !isLoading) {
      const isAuthenticated = !!user;
      
      if (requireAuth && !isAuthenticated) {
        // User needs to be logged in but isn't
        console.log("AuthGuard: Unauthorized access, redirecting to login");
        toast.error("Please log in to access this page");
        navigate("/auth/login", { 
          state: { returnUrl: location.pathname + location.search } 
        });
      } else if (!requireAuth && isAuthenticated) {
        // User is logged in but the page is only for non-authenticated users
        console.log("AuthGuard: User already authenticated, redirecting to home");
        navigate("/");
      }
    }
  }, [user, isLoading, navigate, requireAuth, location.pathname, location.search, authChecked]);

  // Show loading state while checking authentication
  if ((isLoading || !authChecked) && requireAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if:
  // 1. We require auth and user is authenticated, OR
  // 2. We don't require auth and user is not authenticated
  const shouldRender = 
    (requireAuth && !!user) || 
    (!requireAuth && !user);

  // If conditions aren't met, render nothing (navigation will happen via useEffect)
  if (!shouldRender && !isLoading && authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If we're still here, we're good to go
  return <>{children}</>;
};

export default AuthGuard;

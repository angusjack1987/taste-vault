
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      const isAuthenticated = !!user;
      
      if (requireAuth && !isAuthenticated) {
        // User needs to be logged in but isn't
        navigate("/auth/login", { 
          state: { returnUrl: location.pathname } 
        });
      } else if (!requireAuth && isAuthenticated) {
        // User is logged in but the page is only for non-authenticated users
        navigate("/");
      }
    }
  }, [user, isLoading, navigate, requireAuth, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Only render children if:
  // 1. We require auth and user is authenticated, OR
  // 2. We don't require auth and user is not authenticated
  const shouldRender = 
    (requireAuth && !!user) || 
    (!requireAuth && !user);

  // If conditions aren't met, render nothing (navigation will happen via useEffect)
  if (!shouldRender && !isLoading) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  // If we're still here, we're good to go
  return <>{children}</>;
};

export default AuthGuard;

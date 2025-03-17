
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ 
  children, 
  requireAuth = true
}: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading) {
      const isAuthenticated = !!user;
      
      if (requireAuth && !isAuthenticated) {
        // User needs to be logged in but isn't
        navigate("/auth/login", { 
          state: { returnUrl: location.pathname + location.search } 
        });
      } else if (!requireAuth && isAuthenticated) {
        // User is logged in but the page is only for non-authenticated users
        navigate("/dashboard");
      }
    }
  }, [user, isLoading, navigate, requireAuth, location.pathname, location.search]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If we require auth and user is not authenticated, show a direct redirect
  if (requireAuth && !user && !isLoading) {
    return <Navigate to="/auth/login" state={{ returnUrl: location.pathname + location.search }} />;
  }

  // If we don't require auth and user is authenticated, redirect to dashboard
  if (!requireAuth && !!user && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

  // If conditions are met, render children
  return <>{children}</>;
};

export default AuthGuard;

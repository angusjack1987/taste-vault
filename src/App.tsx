import { useEffect } from "react";
import { RouterProvider, Navigate } from "react-router-dom";
import { router } from "./router";
import "./App.css";
import useAuth from "@/hooks/useAuth";
import useSync from "@/hooks/useSync";

function App() {
  const { user, isLoading } = useAuth();
  const { setupDataSyncListeners } = useSync();

  // Set up realtime listeners for data syncing when user is logged in
  useEffect(() => {
    if (user) {
      const cleanup = setupDataSyncListeners();
      return cleanup;
    }
  }, [user]);

  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If user is not logged in and auth check is complete, render auth routes
  if (!user && !isLoading) {
    return <RouterProvider router={router} />;
  }

  // Otherwise render all routes (both protected and public)
  return <RouterProvider router={router} />;
}

export default App;

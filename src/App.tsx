
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./App.css";
import useAuth from "@/hooks/useAuth";
import useSync from "@/hooks/useSync";
import { TourProvider } from "./contexts/TourContext";

function App() {
  const { user } = useAuth();
  const { setupDataSyncListeners } = useSync();

  // Set up realtime listeners for data syncing when user is logged in
  useEffect(() => {
    if (user) {
      const cleanup = setupDataSyncListeners();
      return cleanup;
    }
  }, [user]);

  return (
    <TourProvider>
      <RouterProvider router={router} />
    </TourProvider>
  );
}

export default App;

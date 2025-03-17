
import { useEffect } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { router } from "./router";
import "./App.css";
import { SyncProvider } from "./hooks/useSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create a Routes component that uses the router config
const Routes = () => {
  const routes = useRoutes(router);
  return routes;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SyncProvider>
          <div className="app">
            <Routes />
            <Toaster richColors />
          </div>
        </SyncProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

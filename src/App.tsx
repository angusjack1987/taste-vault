
import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
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

function App() {
  const Routes = useRoutes(router);

  return (
    <QueryClientProvider client={queryClient}>
      <SyncProvider>
        <div className="app">
          {Routes}
          <Toaster richColors />
        </div>
      </SyncProvider>
    </QueryClientProvider>
  );
}

export default App;

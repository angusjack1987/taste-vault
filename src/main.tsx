
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './hooks/useAuth'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { TourProvider } from './contexts/TourContext'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TourProvider>
        <App />
        <Toaster position="top-right" />
      </TourProvider>
    </AuthProvider>
  </QueryClientProvider>
);

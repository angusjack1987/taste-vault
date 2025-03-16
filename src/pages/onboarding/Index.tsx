
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState("intro");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isSimulation = new URLSearchParams(location.search).get('simulation') === 'true';

  // Handle completion and navigate to dashboard
  const finishOnboarding = async () => {
    try {
      // If in simulation mode, skip the database update
      if (isSimulation) {
        // Set flag for dashboard to show welcome animation
        sessionStorage.setItem('fromOnboarding', 'true');
        
        // Set transition step for animation
        setCurrentStep("transition");
        
        // Delay navigation to allow animation to complete
        setTimeout(() => {
          navigate("/", { state: { fromOnboarding: true } });
        }, 1800); // Slightly longer than animation duration
        return;
      }

      // Force refresh the onboarding status before transitioning
      if (user) {
        // This ensures the AuthGuard component will have the updated status
        const { data, error } = await supabase
          .from('user_preferences')
          .upsert({ 
            user_id: user.id,
            preferences: { onboarding_completed: true }
          })
          .select('id')
          .single();
          
        if (data) {
          // Successfully completed onboarding
          toast({
            title: "Onboarding complete!",
            description: "Your preferences have been saved.",
          });
        }
      }
      
      // Set flag for dashboard to show welcome animation
      sessionStorage.setItem('fromOnboarding', 'true');
      
      // Set transition step for animation
      setCurrentStep("transition");
      
      // Delay navigation to allow animation to complete
      setTimeout(() => {
        navigate("/", { state: { fromOnboarding: true } });
      }, 1800); // Slightly longer than animation duration
    } catch (error) {
      console.error("Error finishing onboarding:", error);
      // Still navigate to dashboard even if the check fails
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentStep === "intro" && (
        <div className="p-8 max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <ChefHat className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome to Flavor Librarian!</h1>
            <p className="text-muted-foreground">Let's set up your preferences to get started.</p>
          </div>
          
          <div className="border-4 border-black rounded-xl p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {isSimulation && (
              <div className="mb-4 bg-yellow-100 border-2 border-yellow-500 p-4 rounded-lg">
                <p className="text-sm font-medium">Simulation Mode Active</p>
                <p className="text-xs text-muted-foreground">You are viewing the onboarding experience in simulation mode.</p>
              </div>
            )}
            
            <h2 className="text-xl font-bold mb-4">Your Food Preferences</h2>
            <p className="mb-4">This is where you would set up your dietary preferences, cooking skill level, and favorite cuisines.</p>
            
            <Separator className="my-6" />
            
            <h2 className="text-xl font-bold mb-4">Kitchen Inventory</h2>
            <p className="mb-4">Set up your kitchen inventory to help us suggest recipes based on what you have on hand.</p>
            
            <Separator className="my-6" />
            
            <h2 className="text-xl font-bold mb-4">Recipe Collection</h2>
            <p className="mb-4">Import your favorite recipes or start with our recommendations.</p>
            
            {/* This is a simplified onboarding flow. You would typically have multiple steps here */}
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={finishOnboarding} 
                className="bg-primary text-white px-6 py-2 rounded-lg border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
              >
                Complete Setup & Go to Dashboard
              </Button>
            </div>
          </div>
          
          {!isSimulation && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>
          )}
        </div>
      )}
      
      {currentStep === "transition" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#AAFFA9] to-[#7FFFD4]">
          <div className="bg-white p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="animate-bounce mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                <line x1="12" x2="12" y1="2" y2="4"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center animate-pulse">Setting up your kitchen...</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState("intro");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle completion and navigate to dashboard
  const finishOnboarding = async () => {
    try {
      // Force refresh the onboarding status before transitioning
      if (user) {
        // This ensures the AuthGuard component will have the updated status
        const { data } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
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
          <h1 className="text-3xl font-bold mb-6">Welcome to Flavor Librarian!</h1>
          <p className="mb-4">Let's set up your preferences to get started.</p>
          
          {/* This is a simplified onboarding flow. You would typically have multiple steps here */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={finishOnboarding} 
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
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

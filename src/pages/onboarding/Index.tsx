
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

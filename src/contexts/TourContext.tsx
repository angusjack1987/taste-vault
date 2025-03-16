
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TourContextType {
  startTour: () => void;
  endTour: () => void;
  isActive: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider = ({ children }: TourProviderProps) => {
  const [isActive, setIsActive] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Define the tour steps
  const steps: Step[] = [
    {
      target: '.tour-step-1',
      content: 'Welcome to Flavor Librarian! This is your home dashboard where you can see your recently added recipes, favorites, and popular items.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: '.tour-step-2',
      content: 'Check out your recipes here. You can add new ones or browse your collection.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-3',
      content: 'Plan your meals for the week. The app will help you organize your cooking schedule.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-4',
      content: 'Access your settings, preferences, and profile information here.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-5',
      content: 'This is your quick action button. Add recipes, check your fridge, manage your shopping list, or use the Sous Chef feature.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-6',
      content: 'Your fridge keeps track of all the ingredients you have on hand.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-7',
      content: 'Manage your shopping list here - add items you need to buy.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-8',
      content: 'The Sous Chef feature provides cooking assistance and guidance.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-9',
      content: 'That\'s it! You\'re all set to start using Flavor Librarian. Enjoy cooking!',
      disableBeacon: true,
      placement: 'center',
    },
  ];

  useEffect(() => {
    // Check if this is the user's first visit after login
    if (user && location.pathname === '/' && !localStorage.getItem('tourCompleted')) {
      setFirstVisit(true);
      localStorage.setItem('tourCompleted', 'true');
    }
  }, [user, location.pathname]);

  useEffect(() => {
    // Start the tour automatically on first visit
    if (firstVisit) {
      setTimeout(() => {
        startTour();
        setFirstVisit(false);
      }, 1000);
    }
  }, [firstVisit]);

  const startTour = () => {
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    // Tour is finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setIsActive(false);
      toast({
        title: "Tour completed",
        description: "You can start the tour again from the settings page if needed.",
      });
    }
  };

  return (
    <TourContext.Provider value={{ startTour, endTour, isActive }}>
      {children}
      <Joyride
        steps={steps}
        run={isActive}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#FF6B6B',
            arrowColor: '#ffffff',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            textColor: '#333333',
            width: 300,
          },
          buttonNext: {
            backgroundColor: '#FF6B6B',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: '2px solid black',
            padding: '8px 16px',
            fontWeight: 'bold',
          },
          buttonBack: {
            color: '#333333',
            marginRight: 10,
            fontWeight: 'bold',
          },
          buttonSkip: {
            color: '#777777',
            fontWeight: 'bold',
          },
        }}
        callback={handleJoyrideCallback}
        locale={{
          last: 'Finish',
          skip: 'Skip tour',
          next: 'Next',
          back: 'Back',
        }}
      />
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  
  return context;
};

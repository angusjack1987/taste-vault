
import { ReactNode, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  showUserMenu?: boolean;
  action?: React.ReactNode;
  hideNavigation?: boolean;
}

const MainLayout = ({
  children,
  title,
  showBackButton = false,
  showUserMenu = true,
  action,
  hideNavigation = false,
}: MainLayoutProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Add fade-in effect when component mounts
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.add('opacity-0');
      setTimeout(() => {
        mainContent.classList.remove('opacity-0');
        mainContent.classList.add('opacity-100');
      }, 10);
    }
    
    // Set mounted state for staggered animations
    setMounted(true);
    
    return () => setMounted(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      <PageHeader
        title={title}
        showBackButton={showBackButton}
        showUserMenu={showUserMenu}
        action={action}
      />
      
      <main className="flex-1 pb-28 px-4 relative overflow-hidden">
        {/* Enhanced decorative background elements with consistent animations */}
        <div className="absolute top-10 left-5 w-40 h-40 bg-sunshine-400/30 rounded-full blur-3xl -z-10 animate-float"></div>
        <div className="absolute bottom-40 right-10 w-56 h-56 bg-seafoam-500/20 rounded-full blur-3xl -z-10 animate-float delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-ocean-500/15 rounded-full blur-3xl -z-10 animate-float delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-berry-400/20 rounded-full blur-3xl -z-10 animate-float delay-300"></div>
        
        <div 
          className={`max-w-4xl mx-auto w-full relative main-content transition-all duration-500 ease-in-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {children}
        </div>
      </main>
      
      {!hideNavigation && <BottomNav />}
      
      {/* Consistent page transition overlay */}
      <div 
        className={`fixed inset-0 bg-background pointer-events-none z-50 transition-opacity duration-300 ${
          mounted ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default MainLayout;

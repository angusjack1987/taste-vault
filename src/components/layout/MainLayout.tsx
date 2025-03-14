
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
      
      <main className="flex-1 pb-24 px-4 md:px-6 relative overflow-x-hidden overflow-y-auto">
        {/* Subtle background elements */}
        <div className="absolute top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-40 -left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
        
        <div 
          className={`mx-auto w-full md:max-w-6xl lg:max-w-7xl relative main-content transition-all duration-300 ease-in-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {children}
        </div>
      </main>
      
      {!hideNavigation && <BottomNav />}
      
      {/* Page transition overlay */}
      <div 
        className={`fixed inset-0 bg-background pointer-events-none z-50 transition-opacity duration-300 ${
          mounted ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default MainLayout;

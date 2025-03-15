
import { ReactNode, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  
  // Add neo-brutalist transition effect when component mounts or route changes
  useEffect(() => {
    // Set mounted state for staggered animations
    setMounted(true);
    
    // Slide in the content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('translate-x-full', 'opacity-0');
      mainContent.classList.add('translate-x-0', 'opacity-100');
    }
    
    return () => setMounted(false);
  }, [location.pathname]); // Add location dependency to trigger animation on route change

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#AAFFA9] to-[#7FFFD4] overflow-hidden">
      <PageHeader
        title={title}
        showBackButton={showBackButton}
        showUserMenu={showUserMenu}
        action={action}
      />
      
      <main className="flex-1 pb-24 px-4 md:px-6 relative overflow-x-hidden overflow-y-auto">
        {/* Neo-brutalism colorful background elements with rounded corners */}
        <div className="absolute top-20 right-20 w-48 h-48 bg-[#FFD700] border-4 border-black rounded-2xl z-0 rotate-12 shadow-neo-heavy animate-neo-float"></div>
        <div className="absolute bottom-40 left-10 w-32 h-32 bg-[#FF6B6B] border-4 border-black rounded-2xl z-0 -rotate-12 shadow-neo-heavy animate-neo-pulse"></div>
        <div className="absolute top-40 left-10 w-24 h-24 bg-[#4CAF50] border-4 border-black rounded-2xl z-0 rotate-45 shadow-neo-heavy animate-neo-float"></div>
        
        {/* Main content with neo-brutalist slide-in animation */}
        <div 
          className={`mx-auto w-full md:max-w-6xl lg:max-w-7xl xl:max-w-[1900px] relative main-content transition-all duration-500 ease-in-out z-10 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          key={location.pathname} // Key helps React recognize this needs to be re-rendered on route change
        >
          <div className="p-4 md:p-6 neo-container bg-white mb-6 shadow-neo-heavy border-4 border-black rounded-2xl">
            {children}
          </div>
        </div>
      </main>
      
      {!hideNavigation && <BottomNav />}
    </div>
  );
};

export default MainLayout;

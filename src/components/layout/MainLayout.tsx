
import { ReactNode, useEffect, useState, useMemo } from "react";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  
  // Generate a consistent gradient for the page to prevent flashing
  const backgroundGradient = useMemo(() => {
    // Create a deterministic gradient based on pathname to keep it consistent
    const gradientIndex = location.pathname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
    const gradients = [
      'from-[#AAFFA9] to-[#7FFFD4]', // Green to teal
      'from-[#FFB347] to-[#FFCC33]', // Orange to yellow
      'from-[#FF9AA2] to-[#FFB7B2]', // Pink to light pink
      'from-[#C9FFE5] to-[#7FFFD4]', // Light mint to aquamarine
    ];
    return gradients[gradientIndex];
  }, [location.pathname]);
  
  // Handle page transitions
  useEffect(() => {
    const handlePageTransition = async () => {
      setIsTransitioning(true);
      setMounted(false);
      
      // Short delay to trigger exit animation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then set mounted to true to trigger entrance animation
      setMounted(true);
      
      // After animation completes, reset transitioning state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    };
    
    handlePageTransition();
  }, [location.pathname]);

  // Determine if current route should have bottom navigation
  // Only auth routes should not have navigation
  const isAuthRoute = location.pathname.startsWith('/login') || 
                    location.pathname.startsWith('/register') ||
                    location.pathname === '/auth' ||
                    location.pathname.startsWith('/auth/');

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br ${backgroundGradient} overflow-hidden`}>
      <PageHeader
        title={title}
        showBackButton={showBackButton}
        showUserMenu={showUserMenu}
        action={action}
        backgroundGradient={backgroundGradient}
      />
      
      <main className="flex-1 pb-32 pt-4 px-3 md:px-5 relative overflow-x-hidden overflow-y-auto">
        {/* Neo-brutalism colorful background elements with rounded corners */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#FFD700] border-4 border-black rounded-2xl z-0 rotate-12 shadow-neo-heavy animate-neo-float"></div>
        <div className="absolute bottom-40 left-10 w-28 h-28 bg-[#FF6B6B] border-4 border-black rounded-2xl z-0 -rotate-12 shadow-neo-heavy animate-neo-pulse"></div>
        <div className="absolute top-40 left-10 w-20 h-20 bg-[#4CAF50] border-4 border-black rounded-2xl z-0 rotate-45 shadow-neo-heavy animate-neo-float"></div>
        
        {/* Main content with neo-brutalist slide-in animation */}
        <div 
          className={`mx-auto w-full md:max-w-6xl lg:max-w-7xl xl:max-w-[1900px] relative main-content transition-all duration-500 ease-in-out z-10 transform ${
            mounted 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
          }`}
          key={location.pathname} // Key helps React recognize this needs to be re-rendered on route change
        >
          <div className="p-3 md:p-5 neo-container bg-white mb-5 shadow-neo-heavy border-4 border-black rounded-2xl">
            {children}
          </div>
        </div>
      </main>
      
      {/* Show bottom navigation on all pages except auth routes and where explicitly hidden */}
      {!hideNavigation && !isAuthRoute && <BottomNav />}
    </div>
  );
};

export default MainLayout;

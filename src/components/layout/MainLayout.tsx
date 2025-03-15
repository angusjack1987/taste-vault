
import { ReactNode, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";
import { useLocation, useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  showUserMenu?: boolean;
  action?: React.ReactNode;
  hideNavigation?: boolean;
  disableSwipe?: boolean;
}

const MainLayout = ({
  children,
  title,
  showBackButton = false,
  showUserMenu = true,
  action,
  hideNavigation = false,
  disableSwipe = false,
}: MainLayoutProps) => {
  const [mounted, setMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Minimum swipe distance required (in px)
  const minSwipeDistance = 75;
  
  // Main navigation routes in order
  const mainRoutes = ['/', '/recipes', '/meal-plan', '/shopping', '/fridge', '/settings'];
  
  // Handle page navigation through swipe
  useEffect(() => {
    if (touchStart && touchEnd && !disableSwipe) {
      const distance = touchStart - touchEnd;
      const isHorizontalSwipe = Math.abs(distance) > minSwipeDistance;
      
      if (isHorizontalSwipe && !hideNavigation) {
        const currentRouteIndex = mainRoutes.indexOf(location.pathname);
        if (currentRouteIndex !== -1) {
          // If swiping left (positive distance), go to next route
          if (distance > 0 && currentRouteIndex < mainRoutes.length - 1) {
            navigate(mainRoutes[currentRouteIndex + 1]);
          } 
          // If swiping right (negative distance), go to previous route
          else if (distance < 0 && currentRouteIndex > 0) {
            navigate(mainRoutes[currentRouteIndex - 1]);
          }
        }
      }
      
      // Reset touch positions
      setTouchEnd(null);
      setTouchStart(null);
    }
  }, [touchStart, touchEnd]);
  
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

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!disableSwipe) {
      setTouchStart(e.targetTouches[0].clientX);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!disableSwipe) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-gradient-to-br from-[#AAFFA9] to-[#7FFFD4] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <PageHeader
        title={title}
        showBackButton={showBackButton}
        showUserMenu={showUserMenu}
        action={action}
      />
      
      <main className="flex-1 pb-24 pt-8 px-3 md:px-5 relative overflow-x-hidden overflow-y-auto">
        {/* Neo-brutalism colorful background elements with rounded corners */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#FFD700] border-4 border-black rounded-2xl z-0 rotate-12 shadow-neo-heavy animate-neo-float"></div>
        <div className="absolute bottom-40 left-10 w-28 h-28 bg-[#FF6B6B] border-4 border-black rounded-2xl z-0 -rotate-12 shadow-neo-heavy animate-neo-pulse"></div>
        <div className="absolute top-40 left-10 w-20 h-20 bg-[#4CAF50] border-4 border-black rounded-2xl z-0 rotate-45 shadow-neo-heavy animate-neo-float"></div>
        
        {/* Main content with neo-brutalist slide-in animation */}
        <div 
          className={`mx-auto w-full md:max-w-6xl lg:max-w-7xl xl:max-w-[1900px] relative main-content transition-all duration-500 ease-in-out z-10 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          key={location.pathname} // Key helps React recognize this needs to be re-rendered on route change
        >
          <div className="p-3 md:p-5 neo-container bg-white mb-5 shadow-neo-heavy border-4 border-black rounded-2xl">
            {hideNavigation ? (
              <div className="text-center text-xs text-muted-foreground mb-2">
                Swipe between pages is disabled for this view
              </div>
            ) : !disableSwipe ? (
              <div className="text-center text-xs text-muted-foreground mb-2">
                Swipe left or right to navigate between pages
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </main>
      
      {!hideNavigation && <BottomNav />}
    </div>
  );
};

export default MainLayout;


import { ReactNode, useEffect } from "react";
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
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader
        title={title}
        showBackButton={showBackButton}
        showUserMenu={showUserMenu}
        action={action}
      />
      
      <main className="flex-1 pb-28 px-4 relative overflow-hidden">
        {/* Decorative background elements - updated with vibrant colors */}
        <div className="absolute top-10 left-5 w-32 h-32 bg-sunshine-400/30 rounded-full blur-3xl -z-10 animate-float"></div>
        <div className="absolute bottom-40 right-10 w-48 h-48 bg-seafoam-500/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-ocean-500/15 rounded-full blur-3xl -z-10 animate-float"></div>
        
        <div className="max-w-4xl mx-auto w-full relative main-content transition-opacity duration-300 ease-in-out">
          {children}
        </div>
      </main>
      
      {!hideNavigation && <BottomNav />}
    </div>
  );
};

export default MainLayout;

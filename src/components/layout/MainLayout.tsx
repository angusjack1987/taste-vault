
import React from "react";
import { cn } from "@/lib/utils";
import PageHeader from "./PageHeader";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

// Update the props interface to make className optional and add action prop
interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  className?: string;
  hideNav?: boolean;
  action?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title, 
  showBackButton = false,
  className = "",
  hideNav = false,
  action
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {title && <PageHeader title={title} showBackButton={showBackButton} action={action} />}
      
      <main className={cn("flex-1 pb-20 md:pb-24", className)}>
        {children}
      </main>
      
      {!hideNav && (
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 mx-auto z-30 flex justify-center",
          "py-6 md:py-8"
        )}>
          <BottomNav />
        </nav>
      )}
    </div>
  );
};

export default MainLayout;

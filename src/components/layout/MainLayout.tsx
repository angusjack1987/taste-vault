
import React from "react";
import { cn } from "@/lib/utils";
import PageHeader from "./PageHeader";
import BottomNav from "./BottomNav";
import { useMobile } from "@/hooks/use-mobile";

const MainLayout = ({ 
  children, 
  title, 
  showBackButton = false,
  className,
  hideNav = false 
}) => {
  const isMobile = useMobile();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {title && <PageHeader title={title} showBackButton={showBackButton} />}
      
      <main className={cn("flex-1 pb-20 md:pb-24", className)}>
        {children}
      </main>
      
      {!hideNav && (
        <nav className={cn(
          "fixed bottom-6 left-0 right-0 mx-auto z-30 flex justify-center",
          "md:bottom-8"
        )}>
          <BottomNav />
        </nav>
      )}
    </div>
  );
};

export default MainLayout;

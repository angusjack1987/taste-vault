
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import PageHeader from "./PageHeader";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  className?: string;
  hideNav?: boolean;
  action?: React.ReactNode; // Added action prop
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  className,
  hideNav = false,
  action,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      className="min-h-[100dvh] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {title && (
        <PageHeader title={title} showBackButton={showBackButton} action={action} />
      )}
      
      <main className={cn("flex-1 pb-20 md:pb-0", className)}>
        {children}
      </main>
      
      {!hideNav && (
        <nav 
          className={cn(
            "fixed bottom-0 left-0 right-0 bg-background border-t border-border md:border-none py-2 md:py-0 z-30 md:relative shadow-lg md:shadow-none",
            "md:w-full md:flex md:justify-center"
          )}
        >
          <BottomNav />
        </nav>
      )}
    </motion.div>
  );
};

export default MainLayout;

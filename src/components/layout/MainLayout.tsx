
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "./PageHeader";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import useSync from "@/hooks/useSync";
import SyncIcon from "../ui/sync-icon";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
  className?: string;
}

const MainLayout = ({
  children,
  title,
  showBackButton = false,
  action,
  className = "",
}: MainLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isSyncing } = useSync();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader>
        <div className="flex items-center px-4 md:px-6 pb-0 md:pb-2 pt-2 gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 w-8 h-8"
              onClick={handleBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {title && (
            <h1 className="flex-1 flex items-center font-heading text-xl font-semibold tracking-tight">
              {title}
              {!isMobile && (
                <SyncIcon isSyncing={isSyncing} className="ml-2" />
              )}
            </h1>
          )}
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </PageHeader>

      <main className={`flex-1 ${className}`}>{children}</main>

      <BottomNav>
        {isMobile && isSyncing && (
          <div className="absolute left-0 right-0 top-0 flex justify-center">
            <div className="h-1 bg-primary rounded-full w-full animate-pulse"></div>
          </div>
        )}
      </BottomNav>
    </div>
  );
};

export default MainLayout;

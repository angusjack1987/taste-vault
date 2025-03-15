
import React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = false,
  action
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={handleBack}
              className="p-1 -ml-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <h1 className="font-bold truncate">{title}</h1>
        </div>
        
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;

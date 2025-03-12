
import { ArrowLeft, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showUserMenu?: boolean;
  action?: React.ReactNode;
}

const PageHeader = ({
  title,
  showBackButton = false,
  showUserMenu = true,
  action,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border py-3 px-4">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {action && action}
          
          {showUserMenu && (
            <Link to="/profile">
              <Button variant="ghost" size="icon" aria-label="User profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;

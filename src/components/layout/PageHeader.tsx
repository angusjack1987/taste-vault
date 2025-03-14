
import { ArrowLeft, User, Settings, LogOut, ChefHat, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const firstName = user?.user_metadata?.first_name || 'Chef';

  // Special styling for home page title
  const isHomePage = title === "Flavor Librarian";

  return (
    <header className={`sticky top-0 z-20 backdrop-blur-md px-4 pt-6 pb-3 border-b border-border/30 ${
      isHomePage ? 'bg-gradient-sunshine pb-4' : 'bg-background/80'
    }`}>
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {isHomePage ? (
            <div className="flex items-center">
              <div className="mr-3 bg-white p-2 rounded-full shadow-vibrant relative group">
                <ChefHat className="h-7 w-7 text-secondary group-hover:animate-bounce-light" />
                <span className="absolute -top-1 -right-1 bg-sunshine-500 rounded-full p-1 shadow-md">
                  <Sparkles className="h-3 w-3 text-white animate-pulse" />
                </span>
              </div>
              <h1 className="font-fun text-2xl font-bold bg-gradient-to-r from-sunshine-600 to-citrus-800 bg-clip-text text-transparent animate-text-bounce">
                {title}
              </h1>
            </div>
          ) : (
            <h1 className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {title}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {action && action}
          
          {showUserMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="User menu"
                  className="rounded-full bg-secondary/20 h-9 w-9 p-0 overflow-hidden border-2 border-transparent hover:border-secondary"
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-2 border-border animate-in">
                <div className="px-3 py-2 text-sm font-bold text-center">
                  Hi, <span className="text-secondary font-bold">{firstName}</span>!
                </div>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer rounded-lg font-medium">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem className="cursor-pointer rounded-lg font-medium">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500 rounded-lg font-medium" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Fun banner ribbon only on homepage */}
      {isHomePage && (
        <div className="max-w-5xl mx-auto mt-3 text-center">
          <div className="banner-ribbon bg-gradient-to-r from-sunshine-300 to-sunshine-500 py-1 px-4 rounded-lg shadow-neo inline-block transform -rotate-1">
            <p className="text-xs font-bold text-sunshine-900">Your Personal Recipe Assistant</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default PageHeader;

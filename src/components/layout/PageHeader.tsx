
import { ArrowLeft, User, Settings, LogOut } from "lucide-react";
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
  title?: string;
  showBackButton?: boolean;
  showUserMenu?: boolean;
  action?: React.ReactNode;
  backgroundGradient?: string;
  children?: React.ReactNode; // Make sure children is included as a prop
}

const PageHeader = ({
  title,
  showBackButton = false,
  showUserMenu = true,
  action,
  backgroundGradient,
  children,
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
  
  const headerGradient = backgroundGradient || (() => {
    const gradients = [
      'from-[#FF9AA2] to-[#FFB7B2]', // Pink to light pink
      'from-[#FFB347] to-[#FFCC33]', // Orange to yellow
      'from-[#AAFFA9] to-[#11FFBD]', // Green to teal
      'from-[#C9FFE5] to-[#7FFFD4]', // Light mint to aquamarine
    ];
    
    return gradients[Math.floor(Math.random() * gradients.length)];
  })();

  return (
    <header className={`sticky top-0 z-20 bg-gradient-to-r ${headerGradient} backdrop-blur-md pt-6 pb-3 border-b-4 border-black transition-colors duration-500`}>
      {children ? (
        children
      ) : (
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="cheese"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="rounded-full animate-neo-shake"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {title && (
              <h1 className="font-heading text-2xl font-black uppercase text-black relative inline-block">
                {title}
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-black"></span>
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {action && action}
            
            {showUserMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    aria-label="User menu"
                    className="rounded-full bg-white h-9 w-9 p-0 overflow-hidden border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1"
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
                <DropdownMenuContent align="end" className="rounded-xl border-4 border-black animate-in shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  <div className="px-3 py-2 text-sm font-bold text-center bg-yellow-300">
                    Hi, <span className="text-secondary font-bold">{firstName}</span>!
                  </div>
                  <DropdownMenuSeparator className="border-t-2 border-black" />
                  <Link to="/settings/profile">
                    <DropdownMenuItem className="cursor-pointer rounded-lg font-medium hover:bg-blue-100">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className="cursor-pointer rounded-lg font-medium hover:bg-green-100">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="border-t-2 border-black" />
                  <DropdownMenuItem 
                    className="cursor-pointer bg-red-100 text-red-500 focus:text-red-500 rounded-lg font-medium" 
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
      )}
    </header>
  );
};

export default PageHeader;

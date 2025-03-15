
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  User, 
  Utensils, 
  Settings as SettingsIcon, 
  Palette,
  Share, 
  LogOut
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import DevToolsSection from '@/components/settings/DevToolsSection';
import { useAuth } from '@/hooks/useAuth';

const Settings = () => {
  const { signOut } = useAuth();
  
  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      signOut();
    }
  };

  return (
    <MainLayout title="Settings" showBackButton>
      <div className="page-container space-y-8">
        <div className="space-y-2">
          <h2 className="section-title">Account</h2>
          
          <Link to="/profile">
            <Button 
              variant="outline" 
              className="w-full justify-between py-6"
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3" />
                <span>Profile</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        <div className="space-y-2">
          <h2 className="section-title">Preferences</h2>
          
          <Link to="/settings/food-preferences">
            <Button 
              variant="outline" 
              className="w-full justify-between py-6"
            >
              <div className="flex items-center">
                <Utensils className="h-5 w-5 mr-3" />
                <span>Food Preferences</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/settings/ai-settings">
            <Button 
              variant="outline" 
              className="w-full justify-between py-6"
            >
              <div className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-3" />
                <span>AI Assistant Settings</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>

          <Link to="/design-system">
            <Button 
              variant="outline" 
              className="w-full justify-between py-6"
            >
              <div className="flex items-center">
                <Palette className="h-5 w-5 mr-3" />
                <span>Design System</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        <div className="space-y-2">
          <h2 className="section-title">Session</h2>
          
          <Button 
            variant="destructive" 
            className="w-full justify-center py-6"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
        
        {/* Development tools for testing */}
        <DevToolsSection />
      </div>
    </MainLayout>
  );
};

export default Settings;

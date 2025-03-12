
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layout/MainLayout";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mealRemindersEnabled, setMealRemindersEnabled] = useState(true);
  
  return (
    <MainLayout title="Settings">
      <div className="page-container">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex flex-col">
                  <span>Notifications</span>
                  <span className="text-sm text-muted-foreground">
                    Receive updates about your recipes and meal plans
                  </span>
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="meal-reminders" className="flex flex-col">
                  <span>Meal Reminders</span>
                  <span className="text-sm text-muted-foreground">
                    Get reminded about upcoming meals
                  </span>
                </Label>
                <Switch
                  id="meal-reminders"
                  checked={mealRemindersEnabled}
                  onCheckedChange={setMealRemindersEnabled}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Account Settings</h2>
            <div className="space-y-1">
              <Link 
                to="/profile" 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted"
              >
                <div>
                  <span className="font-medium">Profile</span>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                onClick={() => console.log("Change password")}
              >
                <div>
                  <span className="font-medium">Change Password</span>
                  <p className="text-sm text-muted-foreground">
                    Update your password
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                onClick={() => console.log("Manage notifications")}
              >
                <div>
                  <span className="font-medium">Notification Preferences</span>
                  <p className="text-sm text-muted-foreground">
                    Customize your notification settings
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-4">App Settings</h2>
            <div className="space-y-1">
              <Link
                to="/ai-settings"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted"
              >
                <div>
                  <span className="font-medium">AI Configuration</span>
                  <p className="text-sm text-muted-foreground">
                    Manage AI features and API settings
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                onClick={() => console.log("Clear cache")}
              >
                <div>
                  <span className="font-medium">Storage & Cache</span>
                  <p className="text-sm text-muted-foreground">
                    Manage app data and cache
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Help & Support</h2>
            <div className="space-y-1">
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                onClick={() => console.log("Open help center")}
              >
                <div>
                  <span className="font-medium">Help Center</span>
                  <p className="text-sm text-muted-foreground">
                    Get help with using the app
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted"
                onClick={() => console.log("Contact support")}
              >
                <div>
                  <span className="font-medium">Contact Support</span>
                  <p className="text-sm text-muted-foreground">
                    Get in touch with our support team
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <button 
              className="w-full text-left text-red-500 p-3 rounded-lg hover:bg-red-50"
              onClick={() => console.log("Log out")}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;

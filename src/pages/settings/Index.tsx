
import React from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  UtensilsCrossed, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Bell, 
  Sparkles,
  Lock,
  HelpCircle,
  Info
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";

const Settings = () => {
  const { user, signOut } = useAuth();
  
  const settingsGroups = [
    {
      title: "User",
      items: [
        {
          icon: <User className="h-5 w-5 text-blue-600" />,
          label: "Profile",
          path: "/profile",
        },
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: <UtensilsCrossed className="h-5 w-5 text-orange-500" />,
          label: "Food Preferences",
          path: "/settings/food-preferences",
        },
        {
          icon: <Sparkles className="h-5 w-5 text-purple-500" />,
          label: "AI Settings",
          path: "/settings/ai-settings",
        },
        {
          icon: <Bell className="h-5 w-5 text-red-500" />,
          label: "Notifications",
          path: "/settings/notifications",
        },
      ]
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: <Lock className="h-5 w-5 text-green-600" />,
          label: "Privacy",
          path: "/settings/privacy",
        },
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: <HelpCircle className="h-5 w-5 text-amber-500" />,
          label: "Help Center",
          path: "/settings/help",
        },
        {
          icon: <Info className="h-5 w-5 text-blue-500" />,
          label: "About",
          path: "/settings/about",
        },
      ]
    },
  ];
  
  return (
    <MainLayout title="Settings">
      <div className="space-y-6 pb-8">
        {settingsGroups.map((group, index) => (
          <Card key={index}>
            <CardContent className="p-0">
              <div className="p-6 pb-2">
                <h3 className="font-medium text-sm text-muted-foreground">{group.title}</h3>
              </div>
              <div>
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <Link 
                      to={item.path}
                      className="flex items-center justify-between p-6 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    {itemIndex < group.items.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <button
          onClick={() => signOut()}
          className="w-full py-3 text-center bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    </MainLayout>
  );
};

export default Settings;

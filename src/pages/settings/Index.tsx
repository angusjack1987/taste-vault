import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  UtensilsCrossed, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Bell, 
  Sparkles,
  Lock,
  HelpCircle,
  Info,
  Palette,
  PlayCircle,
  Share
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTour } from "@/contexts/TourContext";

// Define the interface for settings items
interface SettingsItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  bgColor: string;
  onClick?: () => void;
}

// Define the interface for settings groups
interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { startTour } = useTour();
  
  const settingsGroups: SettingsGroup[] = [
    {
      title: "User",
      items: [
        {
          icon: <User className="h-5 w-5 text-blue-600" />,
          label: "Profile",
          path: "/profile",
          bgColor: "bg-blue-100",
        },
        {
          icon: <Share className="h-5 w-5 text-indigo-500" />,
          label: "Sync with Others",
          path: "/settings/sync",
          bgColor: "bg-indigo-100",
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
          bgColor: "bg-orange-100",
        },
        {
          icon: <Sparkles className="h-5 w-5 text-purple-500" />,
          label: "AI Settings",
          path: "/settings/ai-settings",
          bgColor: "bg-purple-100",
        },
        {
          icon: <Bell className="h-5 w-5 text-red-500" />,
          label: "Notifications",
          path: "/settings/notifications",
          bgColor: "bg-red-100",
        },
        {
          icon: <Palette className="h-5 w-5 text-green-500" />,
          label: "Design System",
          path: "/settings/design-system",
          bgColor: "bg-green-100",
        },
        {
          icon: <PlayCircle className="h-5 w-5 text-teal-500" />,
          label: "App Tour",
          bgColor: "bg-teal-100",
          onClick: () => startTour(),
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
          bgColor: "bg-green-100",
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
          bgColor: "bg-amber-100",
        },
        {
          icon: <Info className="h-5 w-5 text-blue-500" />,
          label: "About",
          path: "/settings/about",
          bgColor: "bg-blue-100",
        },
      ]
    }
  ];
  
  return (
    <MainLayout title="Settings">
      <div className="space-y-6 pb-8">
        {settingsGroups.map((group, index) => (
          <Card key={index} className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-0">
              <div className="p-6 pb-2">
                <h3 className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">{group.title}</h3>
              </div>
              <div>
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    {item.path ? (
                      <Link 
                        to={item.path}
                        className={`flex items-center justify-between p-6 hover:${item.bgColor} transition-colors`}
                      >
                        <div className={`flex items-center gap-4 ${item.bgColor} px-3 py-1 rounded-lg`}>
                          <div className="bg-white p-2 rounded-md border-2 border-black">
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    ) : (
                      <button 
                        onClick={() => item.onClick?.()}
                        className={`flex items-center justify-between p-6 w-full text-left hover:${item.bgColor} transition-colors`}
                      >
                        <div className={`flex items-center gap-4 ${item.bgColor} px-3 py-1 rounded-lg`}>
                          <div className="bg-white p-2 rounded-md border-2 border-black">
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                    {itemIndex < group.items.length - 1 && <Separator className="bg-black/10" />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button
          onClick={() => signOut()}
          variant="destructive"
          className="w-full py-3 text-center rounded-xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
        >
          Sign Out
        </Button>
      </div>
    </MainLayout>
  );
};

export default Settings;

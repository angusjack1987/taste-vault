
import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

function DefaultDemo() {
  const tabs = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Notifications", icon: Bell, path: "/notifications" },
    { type: "separator" as const },
    { title: "Settings", icon: Settings, path: "/settings" },
    { title: "Support", icon: HelpCircle, path: "/support" },
    { title: "Security", icon: Shield, path: "/security" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

function CustomColorDemo() {
  const tabs = [
    { title: "Profile", icon: User, path: "/profile" },
    { title: "Messages", icon: Mail, path: "/messages" },
    { type: "separator" as const },
    { title: "Documents", icon: FileText, path: "/documents" },
    { title: "Privacy", icon: Lock, path: "/privacy" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs 
        tabs={tabs} 
        activeColor="text-blue-500"
        className="border-blue-200 dark:border-blue-800" 
      />
    </div>
  );
}

export { DefaultDemo, CustomColorDemo };

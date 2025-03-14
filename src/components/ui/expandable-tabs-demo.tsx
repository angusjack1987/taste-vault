
import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

function DefaultDemo() {
  const tabs = [
    { title: "Dashboard", icon: Home, path: "/", type: undefined as const },
    { title: "Notifications", icon: Bell, path: "/notifications", type: undefined as const },
    { type: "separator" as const },
    { title: "Settings", icon: Settings, path: "/settings", type: undefined as const },
    { title: "Support", icon: HelpCircle, path: "/support", type: undefined as const },
    { title: "Security", icon: Shield, path: "/security", type: undefined as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

function CustomColorDemo() {
  const tabs = [
    { title: "Profile", icon: User, path: "/profile", type: undefined as const },
    { title: "Messages", icon: Mail, path: "/messages", type: undefined as const },
    { type: "separator" as const },
    { title: "Documents", icon: FileText, path: "/documents", type: undefined as const },
    { title: "Privacy", icon: Lock, path: "/privacy", type: undefined as const },
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


import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

function DefaultDemo() {
  const tabs = [
    { title: "Dashboard", icon: Home, type: undefined },
    { title: "Notifications", icon: Bell, type: undefined },
    { type: "separator" as const },
    { title: "Settings", icon: Settings, type: undefined },
    { title: "Support", icon: HelpCircle, type: undefined },
    { title: "Security", icon: Shield, type: undefined },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

function CustomColorDemo() {
  const tabs = [
    { title: "Profile", icon: User, type: undefined },
    { title: "Messages", icon: Mail, type: undefined },
    { type: "separator" as const },
    { title: "Documents", icon: FileText, type: undefined },
    { title: "Privacy", icon: Lock, type: undefined },
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

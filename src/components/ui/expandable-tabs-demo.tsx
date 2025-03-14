
import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock, Calendar, Book, ShoppingCart, Refrigerator } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

function DefaultDemo() {
  const tabs = [
    { title: "Home", icon: Home, type: undefined },
    { title: "Recipes", icon: Book, type: undefined },
    { type: "separator" as const },
    { title: "Meal Plan", icon: Calendar, type: undefined },
    { title: "Settings", icon: Settings, type: undefined },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

function CustomColorDemo() {
  const tabs = [
    { title: "Fridge", icon: Refrigerator, type: undefined },
    { title: "Shopping", icon: ShoppingCart, type: undefined },
    { type: "separator" as const },
    { title: "Documents", icon: FileText, type: undefined },
    { title: "Privacy", icon: Lock, type: undefined },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs 
        tabs={tabs} 
        activeColor="text-secondary"
        className="max-w-md mx-auto" 
      />
    </div>
  );
}

export { DefaultDemo, CustomColorDemo };

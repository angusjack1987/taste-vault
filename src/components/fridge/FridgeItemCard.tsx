
import React, { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FridgeItem } from "@/hooks/fridge/types";

interface FridgeItemCardProps {
  item: FridgeItem;
  onDelete: () => void;
  onToggleAlwaysAvailable: (always_available: boolean) => void;
}

const FridgeItemCard = ({ 
  item, 
  onDelete,
  onToggleAlwaysAvailable
}: FridgeItemCardProps) => {
  // Track if toggle is in progress to prevent double-clicks
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggleAlwaysAvailable = (checked: boolean) => {
    // Prevent multiple rapid toggles
    if (isToggling) return;
    
    setIsToggling(true);
    
    console.log(`Toggle always available for ${item.name} to: ${checked}`);
    
    // Call the parent handler with the new value
    onToggleAlwaysAvailable(checked);
    
    // Reset the toggling state after a short delay
    setTimeout(() => setIsToggling(false), 500);
  };
  
  return (
    <Card className={`overflow-hidden border-border rounded-xl hover:shadow-sm transition-all ${item.always_available ? 'border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10' : ''}`}>
      <CardContent className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-bold">{item.name}</p>
              {item.always_available && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            {item.quantity && (
              <p className="text-sm text-muted-foreground">{item.quantity}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Switch 
              checked={!!item.always_available}
              onCheckedChange={handleToggleAlwaysAvailable}
              id={`always-available-${item.id}`}
              disabled={isToggling}
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">Always</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
            className="rounded-full h-8 w-8"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FridgeItemCard;

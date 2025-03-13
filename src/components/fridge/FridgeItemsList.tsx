
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import FridgeItemCard from "./FridgeItemCard";
import { FridgeItem } from "@/hooks/fridge/types";

interface FridgeItemsListProps {
  category: string;
  filteredItems: FridgeItem[];
  isLoading: boolean;
  onDeleteItem: (id: string) => void;
  onToggleAlwaysAvailable: (id: string, value: boolean) => void;
  onClearNonSavedItems: () => void;
}

const FridgeItemsList = ({
  category,
  filteredItems,
  isLoading,
  onDeleteItem,
  onToggleAlwaysAvailable,
  onClearNonSavedItems
}: FridgeItemsListProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {category === "All" ? "All Items" : `${category} Items`}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredItems.length || 0} items
          </span>
          
          {category !== "Always Available" && filteredItems.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearNonSavedItems}
              className="gap-1 text-destructive hover:text-destructive rounded-full"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear Non-Saved</span>
              <span className="inline sm:hidden">Clear</span>
            </Button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {category === "Always Available" 
            ? "No saved items yet. Mark items as 'Always Available'."
            : "No items added yet. Add items using the form above."}
        </div>
      ) : (
        <div className="space-y-2 pb-20">
          {filteredItems.map((item) => (
            <FridgeItemCard 
              key={item.id} 
              item={item} 
              onDelete={() => onDeleteItem(item.id)}
              onToggleAlwaysAvailable={(always_available) => 
                onToggleAlwaysAvailable(item.id, always_available)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FridgeItemsList;

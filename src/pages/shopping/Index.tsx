import { useState } from "react";
import { 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  Plus, 
  Check, 
  X,
  Apple,
  Banana,
  Cherry,
  Grape,
  Milk,
  Beef,
  Fish,
  Wheat,
  Pizza,
  Coffee,
  Egg,
  Carrot,
  Package,
  Wine,
  Refrigerator,
  Candy,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import MainLayout from "@/components/layout/MainLayout";
import useShoppingList, { ShoppingListItem, ShoppingListItemInput } from "@/hooks/useShoppingList";
import useAuth from "@/hooks/useAuth";
import { parseIngredientAmount } from "@/lib/ingredient-parser";

const categoryIcons: Record<string, React.ReactNode> = {
  "PRODUCE": <Apple size={16} className="text-green-500" />,
  "DAIRY": <Milk size={16} className="text-blue-100" />,
  "MEAT": <Beef size={16} className="text-red-400" />,
  "SEAFOOD": <Fish size={16} className="text-blue-400" />,
  "GRAINS": <Wheat size={16} className="text-amber-300" />,
  "CANNED": <Package size={16} className="text-gray-400" />,
  "BAKING": <Egg size={16} className="text-yellow-200" />,
  "CONDIMENTS": <Wine size={16} className="text-yellow-500" />,
  "SPICES": <Flame size={16} className="text-rose-300" />,
  "FROZEN": <Refrigerator size={16} className="text-blue-300" />,
  "SNACKS": <Candy size={16} className="text-pink-300" />,
  "BEVERAGES": <Coffee size={16} className="text-brown-400" />,
  "OTHER": <Package size={16} className="text-gray-400" />
};

const getItemIcon = (item: ShoppingListItem) => {
  const category = item.category || "OTHER";
  const lowerName = item.ingredient.toLowerCase();
  
  if (lowerName.includes("banana")) return <Banana size={16} className="text-yellow-400" />;
  if (lowerName.includes("strawberry") || lowerName.includes("strawberries")) 
    return <Cherry size={16} className="text-red-500" />;
  if (lowerName.includes("grape")) return <Grape size={16} className="text-purple-500" />;
  
  if (lowerName.includes("carrot")) return <Carrot size={16} className="text-orange-500" />;
  
  return categoryIcons[category] || categoryIcons["OTHER"];
};

const ShoppingListPage = () => {
  const { user } = useAuth();
  const {
    useShoppingListItems,
    useAddShoppingListItem,
    useToggleShoppingListItem,
    useDeleteShoppingListItem,
    useClearCheckedItems,
    useClearAllItems
  } = useShoppingList();
  
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const { data: shoppingItems, isLoading } = useShoppingListItems();
  const { mutateAsync: addItem } = useAddShoppingListItem();
  const { mutateAsync: toggleItem } = useToggleShoppingListItem();
  const { mutateAsync: deleteItem } = useDeleteShoppingListItem();
  const { mutateAsync: clearChecked } = useClearCheckedItems();
  const { mutateAsync: clearAll } = useClearAllItems();
  
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.trim()) return;
    
    setIsAdding(true);
    
    try {
      const { name, amount } = parseIngredientAmount(newItem.trim());
      
      const item: ShoppingListItemInput = {
        recipe_id: null,
        ingredient: newItem.trim(),
        category: null,
        is_checked: false,
        quantity: amount,
      };
      
      await addItem(item);
      setNewItem("");
      toast.success("Item added to shopping list");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add to shopping list");
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleToggleItem = async (id: string, isChecked: boolean) => {
    try {
      await toggleItem({ id, isChecked: !isChecked });
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };
  
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success("Item removed from shopping list");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  
  const handleClearChecked = async () => {
    try {
      await clearChecked();
      toast.success("Checked items cleared");
    } catch (error) {
      console.error("Error clearing checked items:", error);
    }
  };
  
  const handleClearAll = async () => {
    const confirmed = window.confirm("Are you sure you want to clear your entire shopping list?");
    
    if (confirmed) {
      try {
        await clearAll();
        toast.success("Shopping list cleared");
      } catch (error) {
        console.error("Error clearing shopping list:", error);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddItem(e as unknown as React.FormEvent);
    }
  };
  
  const categorizeItems = () => {
    if (!shoppingItems) return {};
    
    const uncheckedItems = shoppingItems.filter(item => !item.is_checked);
    const checkedItems = shoppingItems.filter(item => item.is_checked);
    
    const categories: Record<string, ShoppingListItem[]> = {};
    
    uncheckedItems.forEach(item => {
      const category = item.category || "OTHER";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
    
    if (checkedItems.length > 0) {
      categories["CHECKED_ITEMS"] = checkedItems;
    }
    
    return categories;
  };
  
  const categorizedItems = categorizeItems();
  
  const regularCategories = Object.keys(categorizedItems)
    .filter(category => category !== "CHECKED_ITEMS")
    .sort();
    
  const hasCheckedItems = "CHECKED_ITEMS" in categorizedItems;
  
  const sortedCategories = [...regularCategories];
  if (hasCheckedItems) {
    sortedCategories.push("CHECKED_ITEMS");
  }
  
  const totalItems = shoppingItems?.length || 0;
  const checkedItems = shoppingItems?.filter(item => item.is_checked).length || 0;
  
  if (!user) {
    return (
      <MainLayout title="Shopping List">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">
            Please log in to access your shopping list.
          </p>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title="Shopping List" 
      action={
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleClearAll}
          disabled={isLoading || (shoppingItems?.length || 0) === 0}
          title="Clear all items"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      }
    >
      <div className="page-container">
        <div className="mb-4">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add new item..."
              disabled={isAdding}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isAdding || !newItem.trim()}
              size="icon"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </form>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-muted-foreground">
            {totalItems} items ({checkedItems} checked)
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearChecked}
              disabled={checkedItems === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Clear checked
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
              disabled={totalItems === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {totalItems === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-2">Your shopping list is empty</p>
                <p className="text-xs text-muted-foreground">
                  Add items directly or add ingredients from recipes
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-230px)]">
                {sortedCategories.map(category => {
                  const items = categorizedItems[category];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      {category === "CHECKED_ITEMS" ? (
                        <h3 className="font-medium mb-1 text-sm text-muted-foreground flex items-center gap-2 border-t pt-2 mt-2">
                          <Check size={16} className="text-green-500" /> Checked Items
                        </h3>
                      ) : (
                        <h3 className="font-medium mb-1 text-sm text-muted-foreground flex items-center gap-2">
                          {categoryIcons[category]} {category}
                        </h3>
                      )}
                      <ul className="space-y-1 transition-all duration-300">
                        {items.map(item => {
                          const { name } = parseIngredientAmount(item.ingredient);
                          
                          return (
                            <li 
                              key={item.id} 
                              className="flex items-start justify-between gap-2 py-1 px-2 rounded-md hover:bg-muted/50 transition-all duration-300 shopping-list-item"
                            >
                              <div className="flex items-start gap-2 flex-1">
                                <Checkbox 
                                  checked={item.is_checked}
                                  onCheckedChange={() => handleToggleItem(item.id, item.is_checked)}
                                  id={`item-${item.id}`}
                                  className="mt-0.5"
                                />
                                <div className="flex items-center gap-1">
                                  {category !== "CHECKED_ITEMS" && (
                                    <span className="flex-shrink-0">{getItemIcon(item)}</span>
                                  )}
                                  <label 
                                    htmlFor={`item-${item.id}`}
                                    className={`flex-1 cursor-pointer text-sm ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}
                                  >
                                    {name}
                                  </label>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ShoppingListPage;

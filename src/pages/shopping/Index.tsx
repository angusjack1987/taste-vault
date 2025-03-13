
import { useState } from "react";
import { 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  Plus, 
  Check, 
  X,
  Search
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
  const [searchTerm, setSearchTerm] = useState("");
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
      const item: ShoppingListItemInput = {
        recipe_id: null,
        ingredient: newItem.trim(),
        category: null, // Will be auto-categorized in the hook
        is_checked: false,
        quantity: null,
      };
      
      await addItem(item);
      setNewItem("");
      toast.success("Item added to shopping list");
    } catch (error) {
      console.error("Error adding item:", error);
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
  
  // Organize items by category
  const categorizeItems = () => {
    if (!shoppingItems) return {};
    
    const filtered = searchTerm
      ? shoppingItems.filter(item => 
          item.ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
      : shoppingItems;
    
    return filtered.reduce((acc, item) => {
      const category = item.category || "OTHER";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);
  };
  
  const categorizedItems = categorizeItems();
  const sortedCategories = Object.keys(categorizedItems).sort();
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
        <div className="mb-6">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
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
        
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {totalItems} items ({checkedItems} checked)
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearChecked}
            disabled={checkedItems === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Clear checked
          </Button>
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
              <ScrollArea className="h-[calc(100vh-280px)]">
                {sortedCategories.map(category => {
                  const items = categorizedItems[category];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-6">
                      <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                        {category}
                      </h3>
                      <ul className="space-y-2">
                        {items.map(item => {
                          const { name, amount } = parseIngredientAmount(item.ingredient);
                          
                          return (
                            <li 
                              key={item.id} 
                              className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox 
                                  checked={item.is_checked}
                                  onCheckedChange={() => handleToggleItem(item.id, item.is_checked)}
                                  id={`item-${item.id}`}
                                  className="mt-1"
                                />
                                <div>
                                  <label 
                                    htmlFor={`item-${item.id}`}
                                    className={`flex-1 cursor-pointer ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}
                                  >
                                    {name}
                                  </label>
                                  {amount && (
                                    <div className={`text-xs ${item.is_checked ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                                      {amount}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <X className="h-4 w-4" />
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


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useShoppingList from '@/hooks/useShoppingList';
import useAuth from '@/hooks/useAuth';
import { parseIngredientAmount } from '@/lib/ingredient-parser';

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useShoppingListItems } = useShoppingList();
  const { data: shoppingItems, isLoading } = useShoppingListItems();
  
  const [previewItems, setPreviewItems] = useState<Array<{name: string, amount: string | null}>>([]);
  
  useEffect(() => {
    if (shoppingItems && shoppingItems.length > 0) {
      // Get a preview of up to 5 unchecked items
      const uncheckedItems = shoppingItems
        .filter(item => !item.is_checked)
        .slice(0, 5)
        .map(item => {
          const { name, amount } = parseIngredientAmount(item.ingredient);
          return { name, amount };
        });
      
      setPreviewItems(uncheckedItems);
    } else {
      setPreviewItems([]);
    }
  }, [shoppingItems]);
  
  const totalItems = shoppingItems?.length || 0;
  const uncheckedItems = shoppingItems?.filter(item => !item.is_checked).length || 0;
  
  if (!user) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
        <div className="bg-muted rounded-lg p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (totalItems === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
        <div className="bg-muted rounded-lg p-4 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-sm mb-4">
            Your shopping list is empty. Add ingredients from recipes!
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/shopping")}>
            Go to Shopping List
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
      <div className="bg-muted rounded-lg p-4">
        <p className="text-muted-foreground text-sm mb-4">
          {uncheckedItems} items remaining on your shopping list:
        </p>
        <ul className="space-y-2">
          {previewItems.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-sage-500 mt-1.5"></span>
              <div>
                <div>{item.name}</div>
                {item.amount && (
                  <div className="text-xs text-muted-foreground">{item.amount}</div>
                )}
              </div>
            </li>
          ))}
          {uncheckedItems > 5 && (
            <li className="text-sm text-muted-foreground pl-4">
              and {uncheckedItems - 5} more items...
            </li>
          )}
        </ul>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/shopping")}>
            View Full Shopping List
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;

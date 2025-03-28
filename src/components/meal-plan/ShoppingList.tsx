
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ShoppingBag,
  Apple,
  Banana,
  Cherry,
  Milk,
  Beef,
  Fish,
  Wheat,
  Package,
  Egg,
  Wine,
  Refrigerator,
  Pizza,
  Candy,
  Coffee,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useShoppingList from '@/hooks/useShoppingList';
import useAuth from '@/hooks/useAuth';
import { parseIngredientAmount } from '@/lib/ingredient-parser';

// Get more specific icons for each ingredient
const getIngredientIcon = (ingredient: string, category: string | null) => {
  const lowerName = ingredient.toLowerCase();
  
  // Fruit-specific icons
  if (lowerName.includes("banana")) return <Banana size={14} className="text-yellow-400" />;
  if (lowerName.includes("cherry") || lowerName.includes("cherries")) return <Cherry size={14} className="text-red-500" />;
  
  // For other ingredients, use category icons
  return getCategoryIcon(category);
};

// Map categories to icons (enhanced version)
const getCategoryIcon = (category: string | null) => {
  switch (category) {
    case 'PRODUCE': 
      return <Apple size={14} className="text-green-500" />;
    case 'DAIRY': 
      return <Milk size={14} className="text-blue-100" />;
    case 'MEAT': 
      return <Beef size={14} className="text-red-400" />;
    case 'FISH':
    case 'SEAFOOD': 
      return <Fish size={14} className="text-blue-400" />;
    case 'GRAINS': 
      return <Wheat size={14} className="text-amber-300" />;
    case 'CANNED': 
      return <Package size={14} className="text-gray-400" />;
    case 'BAKING': 
      return <Egg size={14} className="text-yellow-200" />;
    case 'CONDIMENTS': 
      return <Wine size={14} className="text-yellow-500" />;
    case 'SPICES': 
      return <Flame size={14} className="text-rose-300" />;
    case 'FROZEN': 
      return <Refrigerator size={14} className="text-blue-300" />;
    case 'SNACKS': 
      return <Candy size={14} className="text-pink-300" />;
    case 'BEVERAGES': 
      return <Coffee size={14} className="text-brown-400" />;
    default: 
      return <Package size={14} className="text-gray-400" />;
  }
};

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useShoppingListItems } = useShoppingList();
  const { data: shoppingItems, isLoading } = useShoppingListItems();
  
  const [previewItems, setPreviewItems] = useState<Array<{
    name: string;
    originalText: string;
    category: string | null;
  }>>();
  
  useEffect(() => {
    if (shoppingItems && shoppingItems.length > 0) {
      // Get a preview of up to 5 unchecked items
      const uncheckedItems = shoppingItems
        .filter(item => !item.is_checked)
        .slice(0, 5)
        .map(item => {
          const { name } = parseIngredientAmount(item.ingredient);
          return { 
            name, 
            originalText: item.ingredient,
            category: item.category 
          };
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
          {previewItems?.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className="flex-shrink-0">
                {getIngredientIcon(item.originalText, item.category)}
              </span>
              <div>{item.name}</div>
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

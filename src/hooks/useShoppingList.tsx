
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useAuth from "./useAuth";

export type ShoppingListItem = {
  id: string;
  user_id: string;
  recipe_id: string | null;
  ingredient: string;
  category: string | null;
  is_checked: boolean;
  quantity: string | null;
  created_at: string;
  updated_at: string;
};

export type ShoppingListItemInput = Omit<
  ShoppingListItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

// Common food categories to help categorize ingredients with expanded terms
const FOOD_CATEGORIES = {
  PRODUCE: [
    // Fruits
    "strawberry", "strawberries", "apple", "banana", "orange", "lemon", "lime", "berry", "berries", 
    "grape", "grapefruit", "melon", "watermelon", "cantaloupe", "kiwi", "mango", "peach", "pear", 
    "pineapple", "plum", "raspberry", "raspberries", "blueberry", "blueberries", "blackberry", "blackberries",
    "cherry", "cherries", "fruit", "fruits", 
    // Vegetables
    "vegetable", "vegetables", "salad", "lettuce", "carrot", "tomato", "onion", "potato", "garlic", 
    "avocado", "cucumber", "zucchini", "broccoli", "cauliflower", "pepper", "bell pepper", "spinach", 
    "kale", "cabbage", "asparagus", "eggplant", "corn", "celery", "mushroom", "green bean", "pea"
  ],
  DAIRY: ["milk", "cheese", "butter", "yogurt", "cream", "ice cream", "sour cream", "egg", "eggs", 
    "parmesan", "mozzarella", "cheddar", "brie", "feta", "cottage cheese", "ricotta", "whipped cream"],
  MEAT: ["chicken", "beef", "steak", "ground beef", "pork", "lamb", "bacon", "sausage", "fish", "salmon", 
    "tuna", "shrimp", "turkey", "ham", "hot dog", "burger", "meatball", "meat", "ground turkey", "duck",
    "shellfish", "lobster", "crab", "scallop", "prawn"],
  GRAINS: ["rice", "pasta", "bread", "flour", "cereal", "oat", "oatmeal", "noodle", "spaghetti", "tortilla", 
    "bagel", "pita", "pancake", "waffle", "muffin", "grain", "quinoa", "barley", "couscous"],
  CANNED: ["can", "canned", "beans", "tomato sauce", "soup", "canned tuna", "canned corn", "olives", 
    "chickpeas", "canned vegetables", "canned fruit", "jar", "preserved"],
  BAKING: ["sugar", "brown sugar", "baking", "flour", "vanilla", "vanilla extract", "chocolate", "cocoa", 
    "baking powder", "baking soda", "yeast", "cake mix", "cookie mix", "frosting", "sprinkles", "almond extract"],
  CONDIMENTS: ["oil", "olive oil", "vinegar", "sauce", "ketchup", "mustard", "mayonnaise", "salsa", 
    "dressing", "soy sauce", "hot sauce", "sriracha", "bbq sauce", "maple syrup", "honey", "jam", "jelly",
    "peanut butter", "nutella"],
  SPICES: ["salt", "pepper", "spice", "oregano", "basil", "paprika", "cumin", "cinnamon", "garlic powder", 
    "onion powder", "seasoning", "thyme", "rosemary", "bay leaf", "curry powder", "turmeric", "ginger",
    "chili powder", "red pepper flakes", "herbs", "herb"],
  FROZEN: ["frozen", "ice cream", "pizza", "frozen vegetables", "frozen fruit", "waffles", "popsicle", 
    "tv dinner", "frozen meal", "frozen yogurt", "frozen berries", "frozen pizza", "ice"],
  SNACKS: ["chip", "chips", "cookie", "cookies", "cracker", "crackers", "popcorn", "nuts", "candy", "chocolate", 
    "snack", "pretzel", "granola bar", "trail mix", "dried fruit", "cheese puffs", "potato chips"],
  BEVERAGES: ["water", "juice", "soda", "pop", "coffee", "tea", "wine", "beer", "milk", "almond milk", 
    "soymilk", "oat milk", "coconut water", "sparkling water", "energy drink", "sports drink", "drink"],
  OTHER: []
};

/**
 * Attempts to categorize an ingredient based on its description
 */
export const categorizeIngredient = (ingredient: string): string => {
  // Convert to lowercase for easier matching
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check each category
  for (const [category, keywords] of Object.entries(FOOD_CATEGORIES)) {
    if (category === "OTHER") continue;
    
    if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
      return category;
    }
  }
  
  // Default category if no match is found
  return "OTHER";
};

const useShoppingList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all shopping list items for the current user
  const fetchShoppingList = async (): Promise<ShoppingListItem[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shopping list:", error);
      toast.error("Failed to load shopping list");
      throw error;
    }

    return data || [];
  };

  // Add a single item to the shopping list
  const addShoppingListItem = async (item: ShoppingListItemInput): Promise<ShoppingListItem> => {
    if (!user) throw new Error("User not authenticated");

    // If category is not provided, attempt to categorize it
    if (!item.category) {
      item.category = categorizeIngredient(item.ingredient);
    }

    const { data, error } = await supabase
      .from("shopping_list")
      .insert([{
        ...item,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding item to shopping list:", error);
      toast.error("Failed to add item to shopping list");
      throw error;
    }

    toast.success("Item added to shopping list");
    return data;
  };

  // Add multiple items to the shopping list (e.g., from a recipe)
  const addManyShoppingListItems = async (items: ShoppingListItemInput[]): Promise<ShoppingListItem[]> => {
    if (!user) throw new Error("User not authenticated");

    // If any item doesn't have a category, categorize it
    const itemsWithCategories = items.map(item => ({
      ...item,
      category: item.category || categorizeIngredient(item.ingredient),
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from("shopping_list")
      .insert(itemsWithCategories)
      .select();

    if (error) {
      console.error("Error adding items to shopping list:", error);
      toast.error("Failed to add items to shopping list");
      throw error;
    }

    return data || [];
  };

  // Toggle the checked status of a shopping list item
  const toggleShoppingListItem = async (id: string, isChecked: boolean): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("shopping_list")
      .update({ is_checked: isChecked })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating shopping list item:", error);
      toast.error("Failed to update item");
      throw error;
    }
  };

  // Delete a shopping list item
  const deleteShoppingListItem = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting shopping list item:", error);
      toast.error("Failed to delete item");
      throw error;
    }
  };

  // Clear all checked items from the shopping list
  const clearCheckedItems = async (): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("user_id", user.id)
      .eq("is_checked", true);

    if (error) {
      console.error("Error clearing checked items:", error);
      toast.error("Failed to clear checked items");
      throw error;
    }
  };

  // Clear all shopping list items
  const clearAllItems = async (): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing shopping list:", error);
      toast.error("Failed to clear shopping list");
      throw error;
    }
  };

  // React Query hooks
  const useShoppingListItems = () => {
    return useQuery({
      queryKey: ["shopping-list"],
      queryFn: fetchShoppingList,
      enabled: !!user,
    });
  };

  const useAddShoppingListItem = () => {
    return useMutation({
      mutationFn: addShoppingListItem,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      },
    });
  };

  const useAddManyShoppingListItems = () => {
    return useMutation({
      mutationFn: addManyShoppingListItems,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      },
    });
  };

  const useToggleShoppingListItem = () => {
    return useMutation({
      mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) => 
        toggleShoppingListItem(id, isChecked),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      },
    });
  };

  const useDeleteShoppingListItem = () => {
    return useMutation({
      mutationFn: deleteShoppingListItem,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      },
    });
  };

  const useClearCheckedItems = () => {
    return useMutation({
      mutationFn: clearCheckedItems,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      },
    });
  };

  const useClearAllItems = () => {
    return useMutation({
      mutationFn: clearAllItems,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      },
    });
  };

  return {
    useShoppingListItems,
    useAddShoppingListItem,
    useAddManyShoppingListItems,
    useToggleShoppingListItem,
    useDeleteShoppingListItem,
    useClearCheckedItems,
    useClearAllItems,
    categorizeIngredient,
  };
};

export default useShoppingList;

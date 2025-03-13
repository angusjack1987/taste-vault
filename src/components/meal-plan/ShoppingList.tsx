
import React from 'react';
import { Button } from '@/components/ui/button';

const ShoppingList = () => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
      <div className="bg-muted rounded-lg p-4">
        <p className="text-muted-foreground text-sm mb-4">
          Based on your meal plan, you'll need:
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-sage-500"></span>
            <span>350g spaghetti</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-sage-500"></span>
            <span>2 avocados</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-sage-500"></span>
            <span>6 large eggs</span>
          </li>
        </ul>
        <div className="mt-4">
          <Button variant="outline" size="sm">
            View Full Shopping List
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;


import React, { createContext, useContext, useState, ReactNode } from "react";

type CategoryFilter = "all" | "breakfast" | "lunch" | "dinner" | "desserts" | "snacks";

interface RecipeFiltersContextType {
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (category: CategoryFilter) => void;
  maxTimeInMinutes: number | null;
  setMaxTimeInMinutes: (time: number | null) => void;
}

const RecipeFiltersContext = createContext<RecipeFiltersContextType | undefined>(undefined);

export function RecipeFiltersProvider({ children }: { children: ReactNode }) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [maxTimeInMinutes, setMaxTimeInMinutes] = useState<number | null>(null);

  return (
    <RecipeFiltersContext.Provider
      value={{
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        categoryFilter,
        setCategoryFilter,
        maxTimeInMinutes,
        setMaxTimeInMinutes
      }}
    >
      {children}
    </RecipeFiltersContext.Provider>
  );
}

export function useRecipeFilters() {
  const context = useContext(RecipeFiltersContext);
  if (context === undefined) {
    throw new Error("useRecipeFilters must be used within a RecipeFiltersProvider");
  }
  return context;
}

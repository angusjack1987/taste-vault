
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/MainLayout";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import FiltersBar from "@/components/recipes/FiltersBar";

// Mock data for our wireframe
const mockRecipes = [
  {
    id: "1",
    title: "Classic Spaghetti Carbonara",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600",
    time: 25,
    rating: 4.8,
  },
  {
    id: "2",
    title: "Avocado Toast with Poached Egg",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600",
    time: 15,
    rating: 4.5,
  },
  {
    id: "3",
    title: "Grilled Salmon with Asparagus",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600",
    time: 30,
    rating: 4.7,
  },
  {
    id: "4",
    title: "Vegetable Stir Fry",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
    time: 20,
    rating: 4.3,
  },
  {
    id: "5",
    title: "Homemade Margherita Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    time: 45,
    rating: 4.9,
  },
  {
    id: "6",
    title: "Berry Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&q=80&w=600",
    time: 10,
    rating: 4.6,
  },
  {
    id: "7",
    title: "Beef Tacos with Homemade Salsa",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=600",
    time: 35,
    rating: 4.7,
  },
  {
    id: "8",
    title: "Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600",
    time: 40,
    rating: 4.5,
  },
];

const RecipesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleShowFilters = () => {
    // This would show a filters dialog in a real implementation
    console.log("Show filters dialog");
  };
  
  return (
    <MainLayout 
      title="Recipes" 
      action={
        <Link to="/recipes/new">
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      }
    >
      <div className="page-container">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search recipes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <FiltersBar onFilterClick={handleShowFilters} />
        
        <div className="mt-6">
          <RecipeGrid recipes={mockRecipes} />
        </div>
      </div>
    </MainLayout>
  );
};

export default RecipesList;

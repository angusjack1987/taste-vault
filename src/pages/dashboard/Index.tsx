
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import CategorySection from "@/components/recipes/CategorySection";

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
];

const Dashboard = () => {
  return (
    <MainLayout title="Flavor Librarian">
      <div className="page-container">
        {/* Today's Meal section */}
        <section className="mb-8">
          <h2 className="section-title">Today's Meal Plan</h2>
          <div className="bg-muted rounded-xl p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Breakfast</h3>
                <div className="flex items-center mt-1 rounded-lg p-2 bg-background">
                  <img 
                    src="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=300" 
                    alt="Avocado Toast" 
                    className="w-12 h-12 rounded object-cover"
                  />
                  <span className="ml-3 text-sm">Avocado Toast with Poached Egg</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Lunch</h3>
                <Link to="/meal-plan" className="block">
                  <div className="rounded-lg p-3 border border-dashed border-border flex items-center justify-center">
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lunch
                    </Button>
                  </div>
                </Link>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Dinner</h3>
                <div className="flex items-center mt-1 rounded-lg p-2 bg-background">
                  <img 
                    src="https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=300" 
                    alt="Spaghetti Carbonara" 
                    className="w-12 h-12 rounded object-cover"
                  />
                  <span className="ml-3 text-sm">Classic Spaghetti Carbonara</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link to="/meal-plan">
                <Button variant="outline" size="sm">View Full Plan</Button>
              </Link>
            </div>
          </div>
        </section>
        
        <CategorySection 
          title="Favorites" 
          recipes={mockRecipes.slice(0, 3)} 
          viewAllLink="/recipes?filter=favorites"
        />
        
        <CategorySection 
          title="Recently Added" 
          recipes={mockRecipes.slice(1, 4)} 
          viewAllLink="/recipes?sort=newest"
        />
        
        <CategorySection 
          title="Popular Recipes" 
          recipes={mockRecipes} 
          viewAllLink="/recipes?sort=popular"
        />
        
        <div className="fixed bottom-24 right-6 z-20">
          <Link to="/recipes/new">
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

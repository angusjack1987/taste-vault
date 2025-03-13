
import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Bookmark, 
  Heart, 
  Share2, 
  Edit 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock recipe data
const mockRecipe = {
  id: "1",
  title: "Classic Spaghetti Carbonara",
  image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=1200",
  time: 25,
  servings: 4,
  difficulty: "Medium",
  rating: 4.8,
  description: "A traditional Italian pasta dish made with eggs, cheese, pancetta, and black pepper.",
  ingredients: [
    "350g spaghetti",
    "150g pancetta or guanciale, diced",
    "3 large eggs",
    "50g pecorino romano, grated (plus extra for serving)",
    "50g parmesan, grated",
    "Freshly ground black pepper",
    "Salt, to taste",
  ],
  instructions: [
    "Bring a large pot of salted water to a boil and cook the spaghetti according to package instructions until al dente.",
    "Meanwhile, in a large skillet, cook the pancetta over medium heat until crispy, about 5-7 minutes.",
    "In a bowl, whisk together the eggs, grated cheeses, and a generous amount of black pepper.",
    "When the pasta is cooked, reserve 1/2 cup of the pasta water, then drain.",
    "Working quickly, add the hot pasta to the skillet with the pancetta, tossing to combine.",
    "Remove the skillet from the heat and pour in the egg and cheese mixture, tossing constantly to create a creamy sauce. If needed, add a splash of the reserved pasta water to loosen the sauce.",
    "Serve immediately with additional grated cheese and black pepper."
  ],
  tags: ["Italian", "Pasta", "Quick", "Dinner"]
};

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // In a real implementation, this would fetch the recipe by ID
  const recipe = mockRecipe;
  
  return (
    <MainLayout 
      title={recipe.title} 
      showBackButton={true}
      action={
        <Button variant="ghost" size="icon" asChild>
          <a href={`/recipes/${id}/edit`}>
            <Edit className="h-5 w-5" />
          </a>
        </Button>
      }
    >
      <div>
        <div className="relative">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h1 className="text-white text-xl font-semibold">{recipe.title}</h1>
          </div>
        </div>
        
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">{recipe.time} min</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">{recipe.servings} servings</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <ChefHat className="w-4 h-4 mr-1" />
                <span className="text-sm">{recipe.difficulty}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">{recipe.description}</p>
          
          <Tabs defaultValue="ingredients" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="mt-4">
              <ScrollArea className="max-h-[400px]">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-baseline gap-2">
                      <span className="w-2 h-2 rounded-full bg-sage-500 mt-1.5 flex-shrink-0"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="instructions" className="mt-4">
              <ScrollArea className="max-h-[400px]">
                <ol className="space-y-4">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 bg-sage-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex-1 max-w-40"
              onClick={() => console.log('Add to shopping list')}
            >
              Add to Shopping List
            </Button>
            <Button 
              className="flex-1 max-w-40"
              onClick={() => console.log('Add to meal plan')}
            >
              Add to Meal Plan
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RecipeDetail;

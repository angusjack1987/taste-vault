import { Plus, Loader2, ChefHat, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import CategorySection from "@/components/recipes/CategorySection";
import useRecipes from "@/hooks/useRecipes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const {
    useAllRecipes
  } = useRecipes();
  const {
    data: recipes,
    isLoading
  } = useAllRecipes();
  const location = useLocation();
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  
  useEffect(() => {
    const comingFromOnboarding = location.state?.fromOnboarding || 
                                sessionStorage.getItem('fromOnboarding') === 'true';
    
    if (comingFromOnboarding) {
      setShowWelcomeAnimation(true);
      sessionStorage.removeItem('fromOnboarding');
      
      const timer = setTimeout(() => {
        setShowWelcomeAnimation(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  const formattedRecipes = recipes?.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || "",
    time: recipe.time || undefined,
    rating: undefined
  })) || [];
  
  const recentlyAdded = [...(formattedRecipes || [])].slice(0, 3);
  const favorites = formattedRecipes.slice(0, 3);
  const popular = formattedRecipes.slice(0, 4);
  const emptyStateMessage = "You haven't created any recipes yet. Click the + button to add your first recipe!";
  
  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { 
        duration: 0.3,
        ease: "easeIn" 
      }
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: showWelcomeAnimation ? 1.5 : 0,
        duration: 0.5 
      }
    }
  };

  return (
    <MainLayout title="Flavor Librarian">
      {showWelcomeAnimation && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#AAFFA9] to-[#7FFFD4]"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0] }}
          transition={{ 
            duration: 2.5,
            times: [0, 0.8, 1],
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="bg-white p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                transition: { 
                  duration: 1.5,
                  repeat: 1,
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }
              }}
            >
              <ChefHat className="h-24 w-24 mx-auto text-primary" />
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold mt-4 text-center"
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { 
                  duration: 1,
                  repeat: 1,
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }
              }}
            >
              Welcome to Flavor Librarian!
            </motion.h1>
          </motion.div>
        </motion.div>
      )}
      
      <motion.div 
        className="page-container tour-step-9"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes?.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-xl bg-gradient-to-b from-yellow-200 to-orange-200 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <ChefHat className="h-16 w-16 mx-auto mb-4 text-orange-500 animate-bounce" />
            <p className="text-lg mb-4 font-bold">{emptyStateMessage}</p>
            <Link to="/recipes/new" className="mt-4 inline-block">
              <Button variant="tomato" className="rounded-xl px-6 py-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all">
                <Plus className="h-5 w-5 mr-2" />
                Create First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {recentlyAdded.length > 0 && (
              <CategorySection 
                title={<span className="flex items-center text-left py-[3px] mx-[5px]">Recently Added <span className="text-sm font-normal bg-green-300 ml-2 px-2 py-1 rounded-lg border-2 border-black">Fresh & New</span></span>} 
                recipes={recentlyAdded} 
                viewAllLink="/recipes?sort=newest" 
              />
            )}
            
            {favorites.length > 0 && (
              <CategorySection 
                title={<span className="flex items-center">Favorites <span className="text-sm font-normal bg-red-300 ml-2 px-2 py-1 rounded-lg border-2 border-black">Your Top Picks</span></span>} 
                recipes={favorites} 
                viewAllLink="/recipes?filter=favorites" 
              />
            )}
            
            {popular.length > 0 && (
              <CategorySection 
                title={<div className="flex items-center">
                  <span>Popular Recipes</span>
                  <Sparkles className="h-5 w-5 text-yellow-500 ml-2 animate-pulse" />
                </div>} 
                recipes={popular}
                viewAllLink="/recipes?sort=popular" 
              />
            )}
          </>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;

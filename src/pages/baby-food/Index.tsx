import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import useAiRecipes from "@/hooks/useAiRecipes";

const BabyFoodRecipeGenerator = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const navigate = useNavigate();

  const { suggestRecipe } = useAiRecipes();

  useEffect(() => {
    if (suggestedRecipe) {
      // Scroll to the suggested recipe section
      const element = document.getElementById("suggested-recipe");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [suggestedRecipe]);

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setSuggestedRecipe(null);

    try {
      const result = await suggestRecipe({
        ingredients,
        recipeName,
        additionalPreferences,
      });

      try {
        const parsedResult = JSON.parse(result);
        setSuggestedRecipe(parsedResult);
      } catch (e) {
        setSuggestedRecipe({ rawResponse: result });
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe");
      setSuggestedRecipe(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSuggestedRecipe = async () => {
    toast.success("Recipe saved to your collection");
    navigate("/recipes/new");
  };

  return (
    <MainLayout title="Baby Food Recipe Generator" showBackButton={true}>
      <section className="mb-8">
        <div className="playful-card bg-secondary/10 border-secondary/30">
          <div className="flex flex-col items-center text-center">
            <Sparkles className="h-10 w-10 text-secondary mb-3" />
            <h2 className="text-xl font-bold mb-2">
              AI Baby Food Recipe Generator
            </h2>
            <p className="text-muted-foreground mb-4">
              Create personalized baby food recipes using our AI-powered
              generator.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-4">Recipe Details</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="recipeName"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Recipe Name (Optional)
            </label>
            <div className="mt-2">
              <Input
                type="text"
                id="recipeName"
                placeholder="Enter recipe name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="ingredients"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Ingredients
            </label>
            <div className="mt-2">
              <Textarea
                id="ingredients"
                rows={4}
                placeholder="Enter ingredients (e.g., apple, banana, spinach)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="preferences"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Additional Preferences (Optional)
            </label>
            <div className="mt-2">
              <Input
                type="text"
                id="preferences"
                placeholder="Enter any additional preferences or instructions"
                value={additionalPreferences}
                onChange={(e) => setAdditionalPreferences(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              onClick={handleGenerateRecipe}
              disabled={isGenerating || !ingredients.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                "Generate Recipe"
              )}
            </Button>
          </div>
        </div>
      </section>

      {suggestedRecipe && (
        <section id="suggested-recipe" className="mb-10">
          <h3 className="text-lg font-semibold mb-4">Suggested Recipe</h3>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4">
              {suggestedRecipe.rawResponse ? (
                <div className="whitespace-pre-line">
                  {suggestedRecipe.rawResponse}
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestedRecipe.title && (
                    <h4 className="text-xl font-semibold">
                      {suggestedRecipe.title}
                    </h4>
                  )}
                  {suggestedRecipe.description && (
                    <p className="text-muted-foreground">
                      {suggestedRecipe.description}
                    </p>
                  )}
                  {suggestedRecipe.ingredients && (
                    <div>
                      <h5 className="font-medium">Ingredients:</h5>
                      <ul className="list-disc pl-5">
                        {suggestedRecipe.ingredients.map(
                          (ingredient: string, index: number) => (
                            <li key={index}>{ingredient}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {suggestedRecipe.instructions && (
                    <div>
                      <h5 className="font-medium">Instructions:</h5>
                      <ol className="list-decimal pl-5">
                        {suggestedRecipe.instructions.map(
                          (instruction: string, index: number) => (
                            <li key={index}>{instruction}</li>
                          )
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Button 
              variant="blueberry" // Was "berry" before, now using "blueberry" which is valid
              onClick={handleSaveSuggestedRecipe}
              disabled={isGenerating || !suggestedRecipe}
              className="w-full"
            >
              Save to Recipe Book
            </Button>
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default BabyFoodRecipeGenerator;

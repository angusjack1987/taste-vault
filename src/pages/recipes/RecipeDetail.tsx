
  const getIngredientIcon = (ingredientName: string) => {
    const lowerName = ingredientName.toLowerCase();
    if (/chicken|turkey|beef|meat|steak|pork|lamb|veal/i.test(lowerName)) {
      return <Beef className="h-4 w-4 text-sage-500" />;
    } else if (/fish|salmon|tuna|cod|tilapia|shrimp|prawn|seafood/i.test(lowerName)) {
      return <Fish className="h-4 w-4 text-sage-500" />;
    } else if (/apple|banana|orange|grape|berry|berries|fruit|pear|peach|plum|mango|pineapple|watermelon|melon|kiwi|cherry|cherries|strawberry|blueberry|raspberry|blackberry|blackberries|cherry|cherries/i.test(lowerName)) {
      return <Apple className="h-4 w-4 text-sage-500" />;
    } else if (/egg|eggs/i.test(lowerName)) {
      return <Egg className="h-4 w-4 text-sage-500" />;
    } else if (/flour|bread|rice|pasta|grain|wheat|cereal|oat/i.test(lowerName)) {
      return <Wheat className="h-4 w-4 text-sage-500" />;
    } else if (/carrot|vegetable|tomato|potato|onion|garlic|pepper|cucumber|lettuce/i.test(lowerName)) {
      return <Carrot className="h-4 w-4 text-sage-500" />;
    } else {
      return <Utensils className="h-4 w-4 text-sage-500" />;
    }
  };

  const handleAddToShoppingList = async (selectedIngredients: string[] = []) => {
    if (!recipe) return;
    setAddingToShoppingList(true);
    try {
      const ingredientsToAdd = selectedIngredients.length > 0 ? selectedIngredients : recipe.ingredients;
      const shoppingItems: ShoppingListItemInput[] = ingredientsToAdd.map(ingredient => ({
        recipe_id: recipe.id,
        ingredient,
        category: categorizeIngredient(ingredient),
        is_checked: false,
        quantity: null
      }));
      await addToShoppingList(shoppingItems);
      toast.success(`${ingredientsToAdd.length} items added to shopping list`);
      setSelectIngredientsDialogOpen(false);
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      toast.error("Failed to add to shopping list");
    } finally {
      setAddingToShoppingList(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipe || !id) return;
    setIsDeleting(true);
    try {
      await deleteRecipe(id);
      toast.success("Recipe deleted successfully");
      navigate("/recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenSuggestDialog = () => {
    setSuggestDialogOpen(true);
  };

  const handleOpenVariationsDialog = () => {
    setVariationsDialogOpen(true);
  };

  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
  };

  const handleOpenSelectIngredientsDialog = () => {
    setSelectIngredientsDialogOpen(true);
  };

  const handleGenerateVariation = async (type: string, preferences?: string) => {
    if (!recipe) return;
    setParsingMealSuggestion(true);
    try {
      let promptPrefix = "";
      switch (type) {
        case "variation":
          promptPrefix = `Create a variation of "${recipe.title}" that maintains its essence but offers a new experience.`;
          break;
        case "remix":
          promptPrefix = `Reimagine "${recipe.title}" with creative twists, unexpected ingredients, or transformative techniques.`;
          break;
        case "substitution":
          promptPrefix = `Adapt "${recipe.title}" with ingredient substitutions${preferences ? ` for ${preferences}` : ""} while maintaining flavor and texture.`;
          break;
      }
      setAdditionalPreferences(promptPrefix);
      const result = await suggestMealForPlan({
        mealType: suggestMealType,
        additionalPreferences: promptPrefix
      });
      try {
        const parsedResult = JSON.parse(result);
        setSuggestedMeal(parsedResult);
        setVariationsDialogOpen(false);
        setSuggestDialogOpen(true);
      } catch (e) {
        setSuggestedMeal({
          rawResponse: result
        });
        setVariationsDialogOpen(false);
        setSuggestDialogOpen(true);
      }
    } catch (error) {
      console.error("Error suggesting variations:", error);
      toast.error("Failed to generate variation");
      setSuggestedMeal(null);
    } finally {
      setParsingMealSuggestion(false);
    }
  };

  const handleSuggestMeal = async () => {
    if (!recipe) return;
    setParsingMealSuggestion(true);
    try {
      setAdditionalPreferences(`Similar to "${recipe.title}" but with variations`);
      const result = await suggestMealForPlan({
        mealType: suggestMealType,
        additionalPreferences: `Similar to "${recipe.title}" but with variations`
      });
      try {
        const parsedResult = JSON.parse(result);
        setSuggestedMeal(parsedResult);
      } catch (e) {
        setSuggestedMeal({
          rawResponse: result
        });
      }
    } catch (error) {
      console.error("Error suggesting meal:", error);
      toast.error("Failed to generate suggestions");
      setSuggestedMeal(null);
    } finally {
      setParsingMealSuggestion(false);
    }
  };

  const handleSaveSuggestedRecipe = async (optionIndex: number) => {
    toast.success("Recipe variation saved to your collection");
    setSuggestDialogOpen(false);
    setSuggestedMeal(null);
  };

  const handleResetSuggestedMeal = () => {
    setSuggestedMeal(null);
  };

  const handleShareRecipe = (method: string) => {
    if (!recipe) return;
    const recipeUrl = window.location.href;
    const recipeTitle = recipe.title;
    const recipeDescription = recipe.description || "Check out this recipe!";
    switch (method) {
      case "copy":
        navigator.clipboard.writeText(recipeUrl).then(() => {
          toast.success("Link copied to clipboard");
          setShareDialogOpen(false);
        });
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodeURIComponent(`${recipeDescription}\n\n${recipeUrl}`)}`;
        setShareDialogOpen(false);
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${recipeTitle}\n${recipeDescription}\n\n${recipeUrl}`)}`, "_blank");
        setShareDialogOpen(false);
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${recipeTitle}\n${recipeDescription}`)}&url=${encodeURIComponent(recipeUrl)}`, "_blank");
        setShareDialogOpen(false);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`, "_blank");
        setShareDialogOpen(false);
        break;
      default:
        break;
    }
  };

  const getPastelColorForTag = (tag: string): string => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('breakfast')) return 'bg-[#FEF7CD] text-black';
    if (tagLower.includes('lunch')) return 'bg-[#D3E4FD] text-black';
    if (tagLower.includes('dinner')) return 'bg-[#E5DEFF] text-black';
    if (tagLower.includes('dessert')) return 'bg-[#FFDEE2] text-black';
    if (tagLower.includes('snack')) return 'bg-[#FDE1D3] text-black';
    if (tagLower.includes('italian')) return 'bg-[#F2FCE2] text-black';
    if (tagLower.includes('mexican')) return 'bg-[#FEC6A1] text-black';
    if (tagLower.includes('asian') || tagLower.includes('chinese') || tagLower.includes('japanese')) return 'bg-[#F2FCE2] text-black';
    if (tagLower.includes('american')) return 'bg-[#FEF7CD] text-black';
    const colors = ['bg-[#F2FCE2] text-black', 'bg-[#FEF7CD] text-black', 'bg-[#FEC6A1] text-black', 'bg-[#E5DEFF] text-black', 'bg-[#FFDEE2] text-black', 'bg-[#FDE1D3] text-black', 'bg-[#D3E4FD] text-black'];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

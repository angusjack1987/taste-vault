
import { useState } from "react";
import { X, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useScrapedRecipes from "@/hooks/useScrapedRecipes";

interface ImportRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (recipeData: any) => void;
}

const ImportRecipeDialog = ({ open, onClose, onImport }: ImportRecipeDialogProps) => {
  const [url, setUrl] = useState("");
  const { useScrapeRecipeMutation } = useScrapedRecipes();
  const { mutate: scrapeRecipe, isPending, isError, error } = useScrapeRecipeMutation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    scrapeRecipe(url, {
      onSuccess: (data) => {
        onImport(data);
        onClose();
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Recipe</DialogTitle>
          <DialogDescription>
            Enter a URL to import a recipe from the web.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-2 mt-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="url">Recipe URL</Label>
              <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
                <Link className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  id="url"
                  placeholder="https://example.com/recipe"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                  required
                />
              </div>
            </div>
          </div>
          
          {isError && (
            <div className="mt-2 text-sm text-destructive">
              {(error as Error)?.message || "Failed to import recipe. Please try again."}
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Recipe"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRecipeDialog;

export const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium text-muted-foreground" {...props}>
    {children}
  </label>
);

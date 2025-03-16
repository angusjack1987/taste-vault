
import { useEffect } from "react";
import { ChefHat, Thermometer, CakeSlice, Soup, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CookingTemperatureGuide } from "@/components/sous-chef/CookingTemperatureGuide";
import { Separator } from "@/components/ui/separator";

const SousChefPage = () => {
  useEffect(() => {
    document.title = "Sous Chef | Cooking Helper";
  }, []);

  return (
    <div className="container max-w-4xl pb-24 space-y-6">
      <header className="flex items-center justify-between pt-6 pb-4">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" strokeWidth={2} />
          <h1 className="text-3xl font-bold">Sous Chef</h1>
        </div>
      </header>
      
      <p className="text-lg text-muted-foreground">
        Your personal cooking assistant with helpful guides and tools.
      </p>
      
      <Separator className="my-6" />
      
      <div className="grid gap-6">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Temperature Guide</h2>
          </div>
          <CookingTemperatureGuide />
        </section>
        
        <Separator className="my-4" />
        
        <section className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CakeSlice className="h-5 w-5 text-primary" />
                <CardTitle>Coming Soon</CardTitle>
              </div>
              <CardDescription>Baking Conversion Charts</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Easily convert between different measurement units for baking.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Soup className="h-5 w-5 text-primary" />
                <CardTitle>Coming Soon</CardTitle>
              </div>
              <CardDescription>Cooking Techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Step-by-step guides for various cooking techniques.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SousChefPage;

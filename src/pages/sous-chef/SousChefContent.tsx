
import { useEffect } from "react";
import { ChefHat, Thermometer, CakeSlice, Soup } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookingTemperatureGuide } from "@/components/sous-chef/CookingTemperatureGuide";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ChefVoiceAssistant from "@/components/sous-chef/ChefVoiceAssistant";

const SousChefContent = () => {
  useEffect(() => {
    document.title = "Sous Chef | Cooking Helper";
  }, []);

  return (
    <div className="container max-w-4xl pb-20 px-4 pt-4 space-y-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-7 w-7 text-primary" strokeWidth={2} />
          <h1 className="text-2xl font-bold">Sous Chef</h1>
        </div>
      </header>
      
      <p className="text-base text-muted-foreground">
        Your personal cooking assistant with helpful guides and tools.
      </p>
      
      {/* Add Chef Voice Assistant at the top */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border border-amber-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-lg font-semibold text-orange-800 mb-1">Chef Assistant</h2>
            <p className="text-sm text-amber-700">Ask me anything about cooking!</p>
          </div>
          <ChefVoiceAssistant />
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Temperature Guide</h2>
          </div>
          <CookingTemperatureGuide />
        </section>
        
        <Separator className="my-2" />
        
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CakeSlice className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Baking Conversion</CardTitle>
              </div>
              <CardDescription>Metric to imperial conversions</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-600 mb-3">Convert measurements for baking recipes.</p>
              <Button variant="outline" size="sm" className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Soup className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Cooking Techniques</CardTitle>
              </div>
              <CardDescription>Step-by-step guides</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-600 mb-3">Learn essential cooking methods and techniques.</p>
              <Button variant="outline" size="sm" className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SousChefContent;

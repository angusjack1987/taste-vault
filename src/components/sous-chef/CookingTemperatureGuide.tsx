
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Thermometer, Beef, Drumstick, Fish, Flame, Pizza } from "lucide-react";
import { NeoBrutalistAccordion } from "@/components/ui/neo-accordion";

export const CookingTemperatureGuide = () => {
  const meatTemperatures = [
    { name: "Beef - Rare", fahrenheit: "125°F", celsius: "52°C", description: "Cool red center" },
    { name: "Beef - Medium Rare", fahrenheit: "135°F", celsius: "57°C", description: "Warm red center" },
    { name: "Beef - Medium", fahrenheit: "145°F", celsius: "63°C", description: "Warm pink center" },
    { name: "Beef - Medium Well", fahrenheit: "150°F", celsius: "66°C", description: "Slightly pink center" },
    { name: "Beef - Well Done", fahrenheit: "160°F", celsius: "71°C", description: "No pink" },
    { name: "Ground Beef", fahrenheit: "160°F", celsius: "71°C", description: "Recommended safe temperature" },
    { name: "Lamb", fahrenheit: "145°F", celsius: "63°C", description: "Medium rare to medium" },
    { name: "Pork", fahrenheit: "145°F", celsius: "63°C", description: "Followed by 3 min rest" },
    { name: "Veal", fahrenheit: "145°F", celsius: "63°C", description: "Medium rare to medium" },
  ];

  const poultryTemperatures = [
    { name: "Chicken - Whole", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Chicken - Breasts", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Chicken - Thighs/Wings", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Ground Chicken", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Turkey - Whole", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Turkey - Breast", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Ground Turkey", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
    { name: "Duck", fahrenheit: "165°F", celsius: "74°C", description: "Safe minimum throughout" },
  ];

  const seafoodTemperatures = [
    { name: "Fish - Fin Fish", fahrenheit: "145°F", celsius: "63°C", description: "Should flake easily" },
    { name: "Salmon", fahrenheit: "125-140°F", celsius: "52-60°C", description: "Medium to medium well" },
    { name: "Tuna", fahrenheit: "125°F", celsius: "52°C", description: "Rare to medium rare" },
    { name: "Shrimp", fahrenheit: "120°F", celsius: "49°C", description: "Until opaque and firm" },
    { name: "Lobster", fahrenheit: "140°F", celsius: "60°C", description: "Until flesh is pearly" },
    { name: "Crab", fahrenheit: "145°F", celsius: "63°C", description: "Until flesh is pearly" },
    { name: "Scallops", fahrenheit: "130°F", celsius: "54°C", description: "Until translucent" },
  ];

  const ovenTemperatures = [
    { name: "Very Low", fahrenheit: "250-275°F", celsius: "120-135°C", description: "Slow roasting, dehydrating" },
    { name: "Low", fahrenheit: "300-325°F", celsius: "150-165°C", description: "Slow cooking, casseroles" },
    { name: "Moderate", fahrenheit: "350-375°F", celsius: "175-190°C", description: "Cookies, cakes, roasting" },
    { name: "High", fahrenheit: "400-425°F", celsius: "200-220°C", description: "Breads, pies, roasting" },
    { name: "Very High", fahrenheit: "450-475°F", celsius: "230-245°C", description: "Pizza, quick roasting" },
    { name: "Broil", fahrenheit: "500-550°F", celsius: "260-290°C", description: "Broiling, charring" },
  ];

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
      <CardContent className="p-0">
        <Tabs defaultValue="meat" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-0 bg-background rounded-none border-b-2 border-black">
            <TabsTrigger 
              value="meat" 
              className="py-3 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold"
            >
              <Beef className="w-4 h-4 mr-2" /> Meat
            </TabsTrigger>
            <TabsTrigger 
              value="poultry" 
              className="py-3 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold"
            >
              <Drumstick className="w-4 h-4 mr-2" /> Poultry
            </TabsTrigger>
            <TabsTrigger 
              value="seafood" 
              className="py-3 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold"
            >
              <Fish className="w-4 h-4 mr-2" /> Seafood
            </TabsTrigger>
            <TabsTrigger 
              value="oven" 
              className="py-3 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold"
            >
              <Flame className="w-4 h-4 mr-2" /> Oven
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="meat" className="mt-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Beef className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Meat Internal Temperatures</h3>
              </div>
              <TemperatureTable items={meatTemperatures} />
            </TabsContent>
            
            <TabsContent value="poultry" className="mt-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Drumstick className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Poultry Internal Temperatures</h3>
              </div>
              <TemperatureTable items={poultryTemperatures} />
            </TabsContent>
            
            <TabsContent value="seafood" className="mt-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Fish className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Seafood Internal Temperatures</h3>
              </div>
              <TemperatureTable items={seafoodTemperatures} />
            </TabsContent>
            
            <TabsContent value="oven" className="mt-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Oven Temperature Settings</h3>
              </div>
              <TemperatureTable items={ovenTemperatures} />
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="p-4 pt-0">
          <NeoBrutalistAccordion 
            value="tips" 
            title={
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-primary" />
                <span className="font-medium">Temperature Tips</span>
              </div>
            }
          >
            <div className="space-y-2 text-sm">
              <p>• Always use a reliable meat thermometer to check internal temperatures.</p>
              <p>• Insert the thermometer into the thickest part of the meat, away from bone.</p>
              <p>• Allow large roasts to rest for 15-20 minutes after cooking.</p>
              <p>• Temperature will rise 5-10°F during rest time (carryover cooking).</p>
              <p>• For safety, ground meats should always be cooked to higher temperatures than whole cuts.</p>
            </div>
          </NeoBrutalistAccordion>
        </div>
      </CardContent>
    </Card>
  );
};

interface TemperatureTableProps {
  items: {
    name: string;
    fahrenheit: string;
    celsius: string;
    description: string;
  }[];
}

const TemperatureTable = ({ items }: TemperatureTableProps) => {
  return (
    <div className="relative overflow-x-auto rounded-lg border-2 border-black">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase bg-primary/10 border-b-2 border-black">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-bold">
              Food
            </th>
            <th scope="col" className="px-4 py-3 text-left font-bold">
              °F
            </th>
            <th scope="col" className="px-4 py-3 text-left font-bold">
              °C
            </th>
            <th scope="col" className="px-4 py-3 text-left font-bold">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={index}
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 last:border-0`}
            >
              <td className="px-4 py-2.5 font-medium">
                {item.name}
              </td>
              <td className="px-4 py-2.5">
                {item.fahrenheit}
              </td>
              <td className="px-4 py-2.5">
                {item.celsius}
              </td>
              <td className="px-4 py-2.5">
                {item.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

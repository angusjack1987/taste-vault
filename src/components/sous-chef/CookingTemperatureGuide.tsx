
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Beef, Drumstick, Fish, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const CookingTemperatureGuide = () => {
  const [activeTab, setActiveTab] = useState("meat");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const getTemperatures = (tab: string) => {
    switch (tab) {
      case "meat":
        return meatTemperatures;
      case "poultry":
        return poultryTemperatures;
      case "seafood":
        return seafoodTemperatures;
      case "oven":
        return ovenTemperatures;
      default:
        return meatTemperatures;
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 150;
      
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
      <CardContent className="p-0">
        {/* Scrollable tabs with buttons */}
        <div className="relative">
          <button 
            onClick={() => scroll("left")} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-r-full p-1 shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide py-3 px-8 border-b border-gray-200 gap-2 no-scrollbar"
          >
            <TabButton 
              active={activeTab === "meat"} 
              onClick={() => setActiveTab("meat")}
              icon={<Beef className="w-4 h-4" />}
              label="Meat"
              color="bg-red-400"
            />
            <TabButton 
              active={activeTab === "poultry"} 
              onClick={() => setActiveTab("poultry")}
              icon={<Drumstick className="w-4 h-4" />}
              label="Poultry"
              color="bg-amber-200"
            />
            <TabButton 
              active={activeTab === "seafood"} 
              onClick={() => setActiveTab("seafood")}
              icon={<Fish className="w-4 h-4" />}
              label="Seafood"
              color="bg-blue-400"
            />
            <TabButton 
              active={activeTab === "oven"} 
              onClick={() => setActiveTab("oven")}
              icon={<Flame className="w-4 h-4" />}
              label="Oven"
              color="bg-orange-400"
            />
          </div>
          
          <button 
            onClick={() => scroll("right")} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-l-full p-1 shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
          
        <div className="p-4">
          {/* Tab content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              {activeTab === "meat" && <Beef className="h-5 w-5 text-red-500" />}
              {activeTab === "poultry" && <Drumstick className="h-5 w-5 text-amber-500" />}
              {activeTab === "seafood" && <Fish className="h-5 w-5 text-blue-500" />}
              {activeTab === "oven" && <Flame className="h-5 w-5 text-orange-500" />}
              <h3 className="text-lg font-bold">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Internal Temperatures
              </h3>
            </div>

            <TemperatureTable items={getTemperatures(activeTab)} />
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <Thermometer className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">Temperature Tips</h4>
                  <p>• Always use a reliable meat thermometer to check internal temperatures.</p>
                  <p>• Insert the thermometer into the thickest part of the meat, away from bone.</p>
                  <p>• Allow large roasts to rest for 15-20 minutes after cooking.</p>
                  <p>• Temperature will rise 5-10°F during rest time (carryover cooking).</p>
                  <p>• For safety, ground meats should always be cooked to higher temperatures than whole cuts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const TabButton = ({ active, onClick, icon, label, color }: TabButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
        active 
          ? `${color} text-black font-medium border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]` 
          : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
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
    <div className="relative overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
              Food
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
              °F
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
              °C
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={index}
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 last:border-0`}
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

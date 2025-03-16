
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
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-0">
        {/* Scrollable tabs with buttons */}
        <div className="relative">
          <button 
            onClick={() => scroll("left")} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-r-full p-1 shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto py-3 px-8 gap-2 no-scrollbar scroll-smooth"
          >
            <TabButton 
              active={activeTab === "meat"} 
              onClick={() => setActiveTab("meat")}
              icon={<Beef className="w-4 h-4" />}
              label="Meat"
              color="bg-red-200 hover:bg-red-300"
              activeColor="bg-red-400"
            />
            <TabButton 
              active={activeTab === "poultry"} 
              onClick={() => setActiveTab("poultry")}
              icon={<Drumstick className="w-4 h-4" />}
              label="Poultry"
              color="bg-amber-100 hover:bg-amber-200"
              activeColor="bg-amber-300"
            />
            <TabButton 
              active={activeTab === "seafood"} 
              onClick={() => setActiveTab("seafood")}
              icon={<Fish className="w-4 h-4" />}
              label="Seafood"
              color="bg-blue-100 hover:bg-blue-200"
              activeColor="bg-blue-300"
            />
            <TabButton 
              active={activeTab === "oven"} 
              onClick={() => setActiveTab("oven")}
              icon={<Flame className="w-4 h-4" />}
              label="Oven"
              color="bg-orange-100 hover:bg-orange-200"
              activeColor="bg-orange-300"
            />
            <TabButton 
              active={activeTab === "grill"} 
              onClick={() => setActiveTab("meat")}
              icon={<Flame className="w-4 h-4" />}
              label="Grill"
              color="bg-purple-100 hover:bg-purple-200"
              activeColor="bg-purple-300"
            />
            <TabButton 
              active={activeTab === "sous-vide"} 
              onClick={() => setActiveTab("meat")}
              icon={<Thermometer className="w-4 h-4" />}
              label="Sous Vide"
              color="bg-green-100 hover:bg-green-200"
              activeColor="bg-green-300"
            />
            <TabButton 
              active={activeTab === "desserts"} 
              onClick={() => setActiveTab("oven")}
              icon={<Flame className="w-4 h-4" />}
              label="Desserts"
              color="bg-pink-100 hover:bg-pink-200"
              activeColor="bg-pink-300"
            />
          </div>
          
          <button 
            onClick={() => scroll("right")} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-l-full p-1 shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
          
        <div className="p-4">
          {/* Tab content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              {activeTab === "meat" && <Beef className="h-5 w-5 text-red-500" />}
              {activeTab === "poultry" && <Drumstick className="h-5 w-5 text-amber-500" />}
              {activeTab === "seafood" && <Fish className="h-5 w-5 text-blue-500" />}
              {activeTab === "oven" && <Flame className="h-5 w-5 text-orange-500" />}
              <h3 className="text-lg font-bold text-gray-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Temperatures
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-2 py-2 text-left font-medium text-gray-600">Food</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">°F</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">°C</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {getTemperatures(activeTab).map((item, index) => (
                    <tr 
                      key={index}
                      className="border-b border-gray-100"
                    >
                      <td className="px-2 py-2.5 font-medium">
                        {item.name}
                      </td>
                      <td className="px-2 py-2.5">
                        {item.fahrenheit}
                      </td>
                      <td className="px-2 py-2.5">
                        {item.celsius}
                      </td>
                      <td className="px-2 py-2.5 text-gray-600">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <Thermometer className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p>• Always use a reliable meat thermometer</p>
                  <p>• Insert into the thickest part away from bone</p>
                  <p>• Allow large roasts to rest 15-20 minutes after cooking</p>
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
  activeColor: string;
}

const TabButton = ({ active, onClick, icon, label, color, activeColor }: TabButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs ${
        active 
          ? `${activeColor} text-black font-medium shadow-sm` 
          : `${color} text-gray-700`
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};


import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const DesignSystem = () => {
  const colorPalettes = [
    {
      name: "Main Colors",
      colors: [
        { name: "Primary", variable: "--primary", hex: "#e11d48", class: "bg-primary text-primary-foreground" },
        { name: "Secondary", variable: "--secondary", hex: "#16a34a", class: "bg-secondary text-secondary-foreground" },
        { name: "Accent", variable: "--accent", hex: "#f59e0b", class: "bg-accent text-accent-foreground" },
        { name: "Destructive", variable: "--destructive", hex: "#dc2626", class: "bg-destructive text-destructive-foreground" },
      ]
    },
    {
      name: "Theme Colors",
      colors: [
        { name: "Background", variable: "--background", hex: "#fffbf5", class: "bg-background border-2 border-border text-foreground" },
        { name: "Foreground", variable: "--foreground", hex: "#1f1f1f", class: "bg-foreground text-background" },
        { name: "Card", variable: "--card", hex: "#fffaf0", class: "bg-card text-card-foreground border-2 border-border" },
        { name: "Card Foreground", variable: "--card-foreground", hex: "#1f1f1f", class: "bg-card-foreground text-card" },
        { name: "Muted", variable: "--muted", hex: "#f5efe6", class: "bg-muted text-muted-foreground" },
        { name: "Muted Foreground", variable: "--muted-foreground", hex: "#737373", class: "bg-muted-foreground text-muted" },
        { name: "Border", variable: "--border", hex: "#ffe4c4", class: "bg-border border-2 border-black" },
      ]
    },
    {
      name: "Food-Themed Colors",
      colors: [
        { name: "Tomato", hex: "#FF6347", class: "bg-tomato text-white" },
        { name: "Lettuce", hex: "#4CAF50", class: "bg-lettuce text-white" },
        { name: "Cheese", hex: "#FFC107", class: "bg-cheese text-black" },
        { name: "Bread", hex: "#E0C097", class: "bg-bread text-black" },
        { name: "Blueberry", hex: "#3F51B5", class: "bg-blueberry text-white" },
      ]
    },
    {
      name: "Sunshine",
      colors: [
        { name: "Sunshine 50", hex: "#FFFDF5", class: "bg-sunshine-50 text-black border-2 border-border" },
        { name: "Sunshine 100", hex: "#FFFAEB", class: "bg-sunshine-100 text-black border-2 border-border" },
        { name: "Sunshine 500", hex: "#FFDC72", class: "bg-sunshine-500 text-black" },
        { name: "Sunshine 700", hex: "#FFBD00", class: "bg-sunshine-700 text-black" },
        { name: "Sunshine 900", hex: "#513C06", class: "bg-sunshine-900 text-white" },
      ]
    },
    {
      name: "Charcoal",
      colors: [
        { name: "Charcoal 50", hex: "#F5F5F5", class: "bg-charcoal-50 text-black border-2 border-border" },
        { name: "Charcoal 100", hex: "#E6E6E6", class: "bg-charcoal-100 text-black border-2 border-border" },
        { name: "Charcoal 500", hex: "#333333", class: "bg-charcoal-500 text-white" },
        { name: "Charcoal 700", hex: "#1A1A1A", class: "bg-charcoal-700 text-white" },
        { name: "Charcoal 900", hex: "#0A0A0A", class: "bg-charcoal-900 text-white" },
      ]
    },
    {
      name: "Citrus",
      colors: [
        { name: "Citrus 50", hex: "#FFFDE7", class: "bg-citrus-50 text-black border-2 border-border" },
        { name: "Citrus 100", hex: "#FFF9C4", class: "bg-citrus-100 text-black border-2 border-border" },
        { name: "Citrus 500", hex: "#FFEB3B", class: "bg-citrus-500 text-black" },
        { name: "Citrus 700", hex: "#FBC02D", class: "bg-citrus-700 text-black" },
        { name: "Citrus 900", hex: "#F57F17", class: "bg-citrus-900 text-white" },
      ]
    },
    {
      name: "Seafoam",
      colors: [
        { name: "Seafoam 50", hex: "#E8F5E9", class: "bg-seafoam-50 text-black border-2 border-border" },
        { name: "Seafoam 100", hex: "#C8E6C9", class: "bg-seafoam-100 text-black border-2 border-border" },
        { name: "Seafoam 500", hex: "#4CAF50", class: "bg-seafoam-500 text-white" },
        { name: "Seafoam 700", hex: "#388E3C", class: "bg-seafoam-700 text-white" },
        { name: "Seafoam 900", hex: "#1B5E20", class: "bg-seafoam-900 text-white" },
      ]
    },
    {
      name: "Berry",
      colors: [
        { name: "Berry 50", hex: "#F8E0EB", class: "bg-berry-50 text-black border-2 border-border" },
        { name: "Berry 100", hex: "#F1C1D7", class: "bg-berry-100 text-black border-2 border-border" },
        { name: "Berry 500", hex: "#E91E63", class: "bg-berry-500 text-white" },
        { name: "Berry 700", hex: "#C2185B", class: "bg-berry-700 text-white" },
        { name: "Berry 900", hex: "#880E4F", class: "bg-berry-900 text-white" },
      ]
    },
    {
      name: "Ocean",
      colors: [
        { name: "Ocean 50", hex: "#E3F2FD", class: "bg-ocean-50 text-black border-2 border-border" },
        { name: "Ocean 100", hex: "#BBDEFB", class: "bg-ocean-100 text-black border-2 border-border" },
        { name: "Ocean 500", hex: "#2196F3", class: "bg-ocean-500 text-white" },
        { name: "Ocean 700", hex: "#1976D2", class: "bg-ocean-700 text-white" },
        { name: "Ocean 900", hex: "#0D47A1", class: "bg-ocean-900 text-white" },
      ]
    },
  ];

  const gradients = [
    { name: "Gradient Sunshine", class: "bg-gradient-sunshine" },
    { name: "Gradient Citrus", class: "bg-gradient-citrus" },
    { name: "Gradient Seafoam", class: "bg-gradient-seafoam" },
    { name: "Gradient Ocean", class: "bg-gradient-ocean" },
    { name: "Gradient Berry", class: "bg-gradient-berry" },
    { name: "Gradient Radial", class: "bg-gradient-radial from-sunshine-300 to-sunshine-500" },
  ];

  return (
    <MainLayout title="Design System">
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="space-y-8 pb-10">
          <Tabs defaultValue="components" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 w-full border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <TabsTrigger value="components" className="font-bold">Components</TabsTrigger>
              <TabsTrigger value="colors" className="font-bold">Colors</TabsTrigger>
              <TabsTrigger value="typography" className="font-bold">Typography</TabsTrigger>
            </TabsList>
            
            {/* Components Tab */}
            <TabsContent value="components" className="space-y-6">
              {/* Buttons */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button>Default Button</Button>
                      <code className="text-xs bg-muted p-1 rounded">Button</code>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="secondary">Secondary</Button>
                      <code className="text-xs bg-muted p-1 rounded">variant="secondary"</code>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="destructive">Destructive</Button>
                      <code className="text-xs bg-muted p-1 rounded">variant="destructive"</code>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="outline">Outline</Button>
                      <code className="text-xs bg-muted p-1 rounded">variant="outline"</code>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="ghost">Ghost</Button>
                      <code className="text-xs bg-muted p-1 rounded">variant="ghost"</code>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button variant="link">Link</Button>
                      <code className="text-xs bg-muted p-1 rounded">variant="link"</code>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-bold mb-2">Neo-brutalist Buttons</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <button className="neo-button">Neo Button</button>
                        <code className="text-xs bg-muted p-1 rounded">className="neo-button"</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cards */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="neo-card p-4">
                        <h3 className="font-bold">Neo Card</h3>
                        <p className="text-sm">A card with neo-brutalist styling</p>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="neo-card"</code>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="recipe-card p-4">
                        <h3 className="font-bold">Recipe Card</h3>
                        <p className="text-sm">Recipe-specific card style</p>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="recipe-card"</code>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="stat-card stat-card-tomato">
                        <span className="stat-card-icon">42</span>
                        <span className="stat-card-label">Tomato Stats</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="stat-card stat-card-tomato"</code>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="stat-card stat-card-lettuce">
                        <span className="stat-card-icon">23</span>
                        <span className="stat-card-label">Lettuce Stats</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="stat-card stat-card-lettuce"</code>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="stat-card stat-card-cheese">
                        <span className="stat-card-icon">15</span>
                        <span className="stat-card-label">Cheese Stats</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="stat-card stat-card-cheese"</code>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="stat-card stat-card-bread">
                        <span className="stat-card-icon">37</span>
                        <span className="stat-card-label">Bread Stats</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="stat-card stat-card-bread"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Elements */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Form Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="input">Input</Label>
                      <Input id="input" placeholder="Regular input" />
                      <code className="text-xs bg-muted p-1 rounded">Input</code>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="neo-input">Neo Input</Label>
                      <input id="neo-input" className="neo-input w-full" placeholder="Neo-brutalist input" />
                      <code className="text-xs bg-muted p-1 rounded">className="neo-input"</code>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Accept terms</Label>
                      <code className="text-xs bg-muted p-1 rounded ml-auto">Checkbox</code>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch id="airplane-mode" />
                      <Label htmlFor="airplane-mode">Airplane Mode</Label>
                      <code className="text-xs bg-muted p-1 rounded ml-auto">Switch</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Miscellaneous */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Miscellaneous</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge>Default Badge</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">Badge</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="icon-container icon-container-tomato p-2">
                        <span className="text-sm">Icon Container</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="icon-container icon-container-tomato"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Animations */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Animations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="animate-neo-float bg-sunshine-500 h-16 w-16 rounded-xl border-4 border-black"></div>
                      <code className="text-xs bg-muted p-1 rounded">className="animate-neo-float"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="animate-neo-pulse bg-lettuce h-16 w-16 rounded-xl border-4 border-black"></div>
                      <code className="text-xs bg-muted p-1 rounded">className="animate-neo-pulse"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="animate-neo-shake bg-tomato h-16 w-16 rounded-xl border-4 border-black"></div>
                      <code className="text-xs bg-muted p-1 rounded">className="animate-neo-shake"</code>
                    </div>
                    
                    <div className="space-y-2 flex flex-col">
                      <button className="hover-scale bg-cheese p-4 rounded-xl border-4 border-black">Hover Scale</button>
                      <code className="text-xs bg-muted p-1 rounded">className="hover-scale"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              {colorPalettes.map((palette, index) => (
                <Card key={index} className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">{palette.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {palette.colors.map((color, colorIndex) => (
                        <div key={colorIndex} className="space-y-2">
                          <div className={`h-16 rounded-lg ${color.class} flex items-center justify-center border-4 border-black`}>
                            <span className="font-bold">{color.name}</span>
                          </div>
                          <div className="text-xs space-y-1">
                            {color.variable && <div><code>var({color.variable})</code></div>}
                            <div><code>{color.hex}</code></div>
                            <div><code className="bg-muted p-1 rounded">{color.class}</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Gradients */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Gradients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gradients.map((gradient, index) => (
                      <div key={index} className="space-y-2">
                        <div className={`h-24 rounded-lg ${gradient.class} flex items-center justify-center border-4 border-black`}>
                          <span className="font-bold text-black">{gradient.name}</span>
                        </div>
                        <code className="text-xs bg-muted p-1 rounded">{gradient.class}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-6">
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Headings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-display">Display Text</h1>
                      <code className="text-xs bg-muted p-1 rounded">className="text-display"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-title">Title Text</h2>
                      <code className="text-xs bg-muted p-1 rounded">className="text-title"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-subtitle">Subtitle Text</h3>
                      <code className="text-xs bg-muted p-1 rounded">className="text-subtitle"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="neo-heading">Neo Heading</h3>
                      <code className="text-xs bg-muted p-1 rounded">className="neo-heading"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="section-title">Section Title</h3>
                      <code className="text-xs bg-muted p-1 rounded">className="section-title"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Text Styles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="font-heading">Font Heading</p>
                      <code className="text-xs bg-muted p-1 rounded">className="font-heading"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-sans">Font Sans</p>
                      <code className="text-xs bg-muted p-1 rounded">className="font-sans"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="neo-text-outline text-xl">Neo Text Outline</p>
                      <code className="text-xs bg-muted p-1 rounded">className="neo-text-outline"</code>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="neo-text-chunky text-xl">Neo Text Chunky</p>
                      <code className="text-xs bg-muted p-1 rounded">className="neo-text-chunky"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </MainLayout>
  );
};

export default DesignSystem;

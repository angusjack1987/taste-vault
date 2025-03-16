
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NeoAccordion, NeoBrutalistAccordion } from "@/components/ui/neo-accordion";
import { CleanNeoBrutalistAccordion } from "@/components/ui/clean-accordion";
import { 
  AlertTriangle, 
  ChevronRight, 
  Info, 
  MenuIcon, 
  Plus, 
  Sparkles, 
  Star, 
  User, 
  X 
} from "lucide-react";
import AiSuggestionButton from "@/components/ui/ai-suggestion-button";
import AiSuggestionTooltip from "@/components/ui/ai-suggestion-tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const animations = [
    { name: "Neo Float", class: "animate-neo-float", description: "Floating animation with shadow" },
    { name: "Neo Pulse", class: "animate-neo-pulse", description: "Pulsing animation with shadow" },
    { name: "Neo Shake", class: "animate-neo-shake", description: "Gentle shaking animation" },
    { name: "Hover Scale", class: "hover-scale", description: "Scales up on hover" },
    { name: "Hover Lift", class: "hover-lift", description: "Lifts and adds shadow on hover" },
    { name: "Active Press", class: "active-press", description: "Presses down when active" },
    { name: "Slide In", class: "slide-in", description: "Slides in from the right" },
    { name: "Checkerboard", class: "animate-checkerboard", description: "Animated checkerboard pattern" },
    { name: "Sound Wave", class: "animate-sound-wave", description: "Audio-like wave animation" },
  ];

  return (
    <MainLayout title="Design System">
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="space-y-8 pb-10">
          <Tabs defaultValue="components" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4 w-full border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <TabsTrigger value="components" className="font-bold">Components</TabsTrigger>
              <TabsTrigger value="colors" className="font-bold">Colors</TabsTrigger>
              <TabsTrigger value="typography" className="font-bold">Typography</TabsTrigger>
              <TabsTrigger value="animations" className="font-bold">Animations</TabsTrigger>
              <TabsTrigger value="modals" className="font-bold">Modals & Overlays</TabsTrigger>
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
                      <div className="flex flex-col items-center gap-2">
                        <AiSuggestionButton onClick={() => {}} />
                        <code className="text-xs bg-muted p-1 rounded">AiSuggestionButton</code>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <button className="btn-tomato neo-button">Tomato</button>
                        <code className="text-xs bg-muted p-1 rounded">className="btn-tomato neo-button"</code>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <button className="btn-lettuce neo-button">Lettuce</button>
                        <code className="text-xs bg-muted p-1 rounded">className="btn-lettuce neo-button"</code>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <button className="btn-cheese neo-button">Cheese</button>
                        <code className="text-xs bg-muted p-1 rounded">className="btn-cheese neo-button"</code>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <button className="btn-blueberry neo-button">Blueberry</button>
                        <code className="text-xs bg-muted p-1 rounded">className="btn-blueberry neo-button"</code>
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

                    <div className="flex flex-col gap-2">
                      <div className="playful-card">
                        <h3 className="font-bold">Playful Card</h3>
                        <p className="text-sm">A fun card with playful styling</p>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="playful-card"</code>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="fun-container">
                        <h3 className="font-bold">Fun Container</h3>
                        <p className="text-sm">A fun container with playful styling</p>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="fun-container"</code>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="neo-container">
                        <h3 className="font-bold">Neo Container</h3>
                        <p className="text-sm">A neo-brutalist container</p>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="neo-container"</code>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="section-pink p-4">
                        <h3 className="font-bold">Pink Section</h3>
                        <p className="text-sm">Pink section with neo styling</p>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="section-pink"</code>
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

                    <div className="flex items-center gap-2">
                      <div className="neo-switch">
                        <span>Toggle</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded ml-auto">className="neo-switch"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accordions */}
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Accordions & Expandable Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <NeoBrutalistAccordion 
                        value="neo-accordion-1" 
                        title={<span className="font-bold">Neo Accordion</span>}
                        className="w-full"
                      >
                        <p className="text-sm">This is a neo-brutalist accordion component with bold styling.</p>
                      </NeoBrutalistAccordion>
                      <code className="text-xs bg-muted p-1 rounded">NeoBrutalistAccordion</code>
                    </div>
                    
                    <div className="space-y-2">
                      <CleanNeoBrutalistAccordion 
                        value="clean-accordion-1" 
                        title={<span className="font-bold">Clean Neo Accordion</span>}
                        className="w-full"
                      >
                        <p className="text-sm">This is a cleaner neo-brutalist accordion component.</p>
                      </CleanNeoBrutalistAccordion>
                      <code className="text-xs bg-muted p-1 rounded">CleanNeoBrutalistAccordion</code>
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

                    <div className="space-y-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <code className="text-xs bg-muted p-1 rounded">Avatar</code>
                    </div>

                    <div className="space-y-2">
                      <AiSuggestionTooltip content="This is a helpful tooltip">
                        <div className="p-2 bg-yellow-100 rounded-lg border border-black w-fit">Hover Me</div>
                      </AiSuggestionTooltip>
                      <code className="text-xs bg-muted p-1 rounded">AiSuggestionTooltip</code>
                    </div>

                    <div className="space-y-2">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Alert</AlertTitle>
                        <AlertDescription>
                          This is an alert message.
                        </AlertDescription>
                      </Alert>
                      <code className="text-xs bg-muted p-1 rounded">Alert</code>
                    </div>

                    <div className="space-y-2">
                      <div className="banner-neo">
                        <h3 className="banner-title">Banner Title</h3>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="banner-neo"</code>
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

                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-gradient-cheese flex items-center justify-center border-4 border-black">
                        <span className="font-bold text-black">Gradient Cheese</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="bg-gradient-cheese"</code>
                    </div>

                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-gradient-tomato flex items-center justify-center border-4 border-black">
                        <span className="font-bold text-white">Gradient Tomato</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="bg-gradient-tomato"</code>
                    </div>

                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-gradient-lettuce flex items-center justify-center border-4 border-black">
                        <span className="font-bold text-black">Gradient Lettuce</span>
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="bg-gradient-lettuce"</code>
                    </div>
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

                    <div className="space-y-1">
                      <h3 className="banner-title">Banner Title</h3>
                      <code className="text-xs bg-muted p-1 rounded">className="banner-title"</code>
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

                    <div className="space-y-1">
                      <p className="toggle-label">Toggle Label</p>
                      <code className="text-xs bg-muted p-1 rounded">className="toggle-label"</code>
                    </div>

                    <div className="space-y-1">
                      <p className="story-link">Story Link</p>
                      <code className="text-xs bg-muted p-1 rounded">className="story-link"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Animations Tab */}
            <TabsContent value="animations" className="space-y-6">
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Animation Classes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {animations.map((animation, index) => (
                      <div key={index} className="space-y-2">
                        <div className={`${animation.class} bg-sunshine-500 h-16 w-16 rounded-xl border-4 border-black`}></div>
                        <div>
                          <p className="font-medium">{animation.name}</p>
                          <p className="text-sm text-muted-foreground">{animation.description}</p>
                          <code className="text-xs bg-muted p-1 rounded mt-1">{animation.class}</code>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <div className="animate-neo-shake bg-tomato h-16 w-16 rounded-xl border-4 border-black"></div>
                      <div>
                        <p className="font-medium">Neo Shake</p>
                        <p className="text-sm text-muted-foreground">Animated shaking effect</p>
                        <code className="text-xs bg-muted p-1 rounded mt-1">animate-neo-shake</code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="animate-character bg-cheese h-16 w-16 rounded-xl border-4 border-black flex items-center justify-center">
                        🍔
                      </div>
                      <div>
                        <p className="font-medium">Character Animation</p>
                        <p className="text-sm text-muted-foreground">Fun bouncing character</p>
                        <code className="text-xs bg-muted p-1 rounded mt-1">animate-character</code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="toggle-slide bg-lettuce h-16 w-16 rounded-xl border-4 border-black"></div>
                      <div>
                        <p className="font-medium">Toggle Slide</p>
                        <p className="text-sm text-muted-foreground">Sliding toggle effect</p>
                        <code className="text-xs bg-muted p-1 rounded mt-1">toggle-slide</code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="slide-in bg-berry-500 h-16 w-16 rounded-xl border-4 border-black"></div>
                      <div>
                        <p className="font-medium">Slide In</p>
                        <p className="text-sm text-muted-foreground">Slides in from edge</p>
                        <code className="text-xs bg-muted p-1 rounded mt-1">slide-in</code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="slide-out bg-ocean-500 h-16 w-16 rounded-xl border-4 border-black"></div>
                      <div>
                        <p className="font-medium">Slide Out</p>
                        <p className="text-sm text-muted-foreground">Slides out to edge</p>
                        <code className="text-xs bg-muted p-1 rounded mt-1">slide-out</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Interactive Animations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <button className="hover-scale bg-cheese p-4 rounded-xl border-4 border-black w-full">Hover Scale</button>
                      <code className="text-xs bg-muted p-1 rounded">className="hover-scale"</code>
                    </div>

                    <div className="space-y-3">
                      <button className="hover-lift bg-berry-500 text-white p-4 rounded-xl border-4 border-black w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Hover Lift
                      </button>
                      <code className="text-xs bg-muted p-1 rounded">className="hover-lift"</code>
                    </div>

                    <div className="space-y-3">
                      <button className="active-press hover-lift bg-ocean-500 text-white p-4 rounded-xl border-4 border-black w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Press Me
                      </button>
                      <code className="text-xs bg-muted p-1 rounded">className="active-press hover-lift"</code>
                    </div>

                    <div className="space-y-3">
                      <button className="view-recipe-btn bg-seafoam-500 text-white p-4 rounded-xl w-full">
                        View Recipe
                      </button>
                      <code className="text-xs bg-muted p-1 rounded">className="view-recipe-btn"</code>
                    </div>

                    <div className="space-y-3">
                      <div className="nav-neo-wiggle bg-citrus-500 p-4 rounded-xl border-4 border-black flex items-center justify-center">
                        <MenuIcon className="h-6 w-6" />
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="nav-neo-wiggle"</code>
                    </div>

                    <div className="space-y-3">
                      <div className="nav-neo-shadow bg-white p-4 rounded-xl border-4 border-black flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="nav-neo-shadow"</code>
                    </div>

                    <div className="space-y-3">
                      <div className="nav-item-neo p-4 rounded-xl border-4 border-black flex items-center justify-center bg-white">
                        Nav Item
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="nav-item-neo"</code>
                    </div>

                    <div className="space-y-3">
                      <button className="nav-item hover:nav-item-active flex flex-col items-center justify-center text-xs font-bold uppercase">
                        <Home className="h-6 w-6 mb-1" />
                        <span>Home</span>
                      </button>
                      <code className="text-xs bg-muted p-1 rounded">className="nav-item hover:nav-item-active"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modals Tab */}
            <TabsContent value="modals" className="space-y-6">
              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Dialogs & Modals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent className="border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          <DialogHeader>
                            <DialogTitle>Neo-Brutalist Dialog</DialogTitle>
                            <DialogDescription>
                              This is a styled dialog with neo-brutalist elements.
                            </DialogDescription>
                          </DialogHeader>
                          <p className="py-4">The dialog is styled with neo-brutalist characteristics like heavy borders and shadows.</p>
                          <DialogFooter>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <code className="text-xs bg-muted p-1 rounded">Dialog component with neo-brutalist styling</code>
                    </div>
                    
                    <div className="space-y-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Open Playful Dialog</Button>
                        </DialogTrigger>
                        <DialogContent className="border-4 border-black rounded-xl bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          <DialogHeader>
                            <DialogTitle className="text-black">Playful Dialog</DialogTitle>
                            <DialogDescription className="text-black/70">
                              This is a more colorful dialog style.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-black">The dialog uses food-themed colors and playful elements.</p>
                          </div>
                          <DialogFooter>
                            <Button className="bg-tomato">Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <code className="text-xs bg-muted p-1 rounded">Dialog with food-themed styling</code>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm mb-2">Key Styling Classes for Dialogs:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="p-2 bg-muted rounded-lg">
                          <code>border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]</code>
                          <p className="mt-1 text-muted-foreground">Standard neo-brutalist dialog styling</p>
                        </li>
                        <li className="p-2 bg-muted rounded-lg">
                          <code>dropdown-neo</code>
                          <p className="mt-1 text-muted-foreground">Class for dropdown/popup menus</p>
                        </li>
                        <li className="p-2 bg-muted rounded-lg">
                          <code>glass-morphism</code>
                          <p className="mt-1 text-muted-foreground">Glass-like background effect for modals</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-bold text-sm uppercase bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">Shadows & Outlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="shadow-neo-heavy bg-white p-4 rounded-xl border-4 border-black">
                        Heavy Shadow
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="shadow-neo-heavy"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="shadow-neo-medium bg-white p-4 rounded-xl border-4 border-black">
                        Medium Shadow
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="shadow-neo-medium"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="shadow-neo-light bg-white p-4 rounded-xl border-4 border-black">
                        Light Shadow
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="shadow-neo-light"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="outlined bg-white p-4">
                        Outlined Element
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="outlined"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bold-outline bg-white p-4 rounded-xl border-4 border-black">
                        Bold Outline
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="bold-outline"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="shadow-vibrant bg-white p-4 rounded-xl border-4 border-black">
                        Vibrant Shadow
                      </div>
                      <code className="text-xs bg-muted p-1 rounded">className="shadow-vibrant"</code>
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

function Home(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, Copy, Info, Sparkles } from "lucide-react";
import AiSuggestionButton from "@/components/ui/ai-suggestion-button";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState("components");
  const [copiedText, setCopiedText] = useState("");
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({
      title: "Copied to clipboard",
      description: `'${text}' has been copied to your clipboard.`,
    });
    
    setTimeout(() => {
      setCopiedText("");
    }, 2000);
  };
  
  const colorGroups = [
    {
      title: "Primary Colors",
      colors: [
        { name: "background", value: "bg-background", hex: "hsl(45 100% 98%)" },
        { name: "foreground", value: "text-foreground", hex: "hsl(0 0% 12%)" },
        { name: "primary", value: "bg-primary", hex: "hsl(8 100% 55%)" },
        { name: "secondary", value: "bg-secondary", hex: "hsl(120 100% 25%)" },
        { name: "accent", value: "bg-accent", hex: "hsl(32 100% 50%)" },
        { name: "muted", value: "bg-muted", hex: "hsl(48 40% 92%)" },
        { name: "destructive", value: "bg-destructive", hex: "hsl(0 84.2% 60.2%)" },
      ]
    },
    {
      title: "Food-Themed Colors",
      colors: [
        { name: "tomato", value: "bg-red-500", hex: "#ef4444" },
        { name: "lettuce", value: "bg-green-500", hex: "#22c55e" },
        { name: "cheese", value: "bg-yellow-400", hex: "#facc15" },
        { name: "bread", value: "bg-amber-200", hex: "#fde68a" },
        { name: "blueberry", value: "bg-blue-500", hex: "#3b82f6" },
        { name: "grape", value: "bg-purple-500", hex: "#a855f7" },
        { name: "orange", value: "bg-orange-500", hex: "#f97316" },
        { name: "mint", value: "bg-teal-400", hex: "#2dd4bf" },
      ]
    }
  ];
  
  const animationClasses = [
    { name: "animate-neo-pulse", description: "Pulsing animation" },
    { name: "animate-neo-float", description: "Floating animation" },
    { name: "animate-neo-shake", description: "Shaking animation" },
    { name: "animate-fade-in", description: "Fade in animation" },
    { name: "animate-slide-in-right", description: "Slide in from right" },
    { name: "animate-checkerboard", description: "Checkerboard pattern animation" },
    { name: "animate-sound-wave", description: "Sound wave animation" },
    { name: "animate-spin-neo", description: "Spinning animation" },
    { name: "animate-collapsible-down", description: "Accordion opening animation" },
    { name: "animate-collapsible-up", description: "Accordion closing animation" },
  ];

  const interactionClasses = [
    { name: "hover-scale", description: "Scale up on hover" },
    { name: "hover-lift", description: "Lift up on hover" },
    { name: "active-press", description: "Press down on active" },
    { name: "card-hover", description: "Card hover animation" },
    { name: "btn-hover", description: "Button hover animation" },
    { name: "nav-neo-wiggle", description: "Navigation wiggle on hover" },
  ];
  
  const shadows = [
    { name: "shadow-neo-light", description: "Light neo-brutalist shadow (5px)" },
    { name: "shadow-neo-medium", description: "Medium neo-brutalist shadow (8px)" },
    { name: "shadow-neo-heavy", description: "Heavy neo-brutalist shadow (12px)" },
  ];

  const containers = [
    { name: "neo-container", description: "Neo-brutalist container" },
    { name: "neo-card", description: "Neo-brutalist card" },
    { name: "fun-container", description: "Fun container with thick borders" },
    { name: "section-neo", description: "Neo-brutalist section" },
    { name: "playful-card", description: "Playful card with animations" },
  ];
  
  const gradients = [
    { name: "bg-gradient-cheese", description: "Cheese gradient (yellow)" },
    { name: "bg-gradient-tomato", description: "Tomato gradient (red)" },
    { name: "bg-gradient-lettuce", description: "Lettuce gradient (green)" },
  ];
  
  const typographyStyles = [
    { name: "text-display", description: "Display text (large heading)" },
    { name: "text-title", description: "Title text" },
    { name: "text-subtitle", description: "Subtitle text" },
    { name: "neo-heading", description: "Neo-brutalist heading with underline" },
    { name: "neo-text-outline", description: "Text with outline stroke effect" },
    { name: "neo-text-chunky", description: "Chunky bold uppercase text" },
  ];
  
  const buttonVariants = [
    "default", "destructive", "outline", "secondary", "ghost", 
    "link", "clean", "menu", "tomato", "lettuce", "cheese", 
    "bread", "blueberry", "grape", "orange", "mint"
  ];
  
  const buttonSizes = ["xs", "sm", "default", "lg", "xl"];

  const aiComponents = [
    { name: "AiSuggestionButton", description: "Button with AI styling", component: <AiSuggestionButton onClick={() => {}} label="AI Button" /> },
    { name: "AiSuggestionButton (loading)", description: "Loading state", component: <AiSuggestionButton onClick={() => {}} isLoading={true} /> },
    { name: "AiSuggestionButton (variant)", description: "Different variants", component: <AiSuggestionButton onClick={() => {}} variant="tomato" /> },
  ];

  return (
    <MainLayout title="Design System">
      <div className="mb-6">
        <p className="text-muted-foreground mb-4">
          Reference for design elements and styles in the application. Use these in your prompts or when building new features.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="max-w-full pb-2">
            <TabsList className="flex w-full mb-6 p-1 h-auto flex-nowrap overflow-x-auto">
              <TabsTrigger value="components" className="flex-shrink-0">Components</TabsTrigger>
              <TabsTrigger value="ai-components" className="flex-shrink-0">AI Components</TabsTrigger>
              <TabsTrigger value="colors" className="flex-shrink-0">Colors</TabsTrigger>
              <TabsTrigger value="typography" className="flex-shrink-0">Typography</TabsTrigger>
              <TabsTrigger value="animations" className="flex-shrink-0">Animations</TabsTrigger>
              <TabsTrigger value="modals" className="flex-shrink-0">Modals & Dialogs</TabsTrigger>
              <TabsTrigger value="layouts" className="flex-shrink-0">Layouts</TabsTrigger>
            </TabsList>
          </ScrollArea>
          
          <TabsContent value="components" className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="buttons">
                <AccordionTrigger className="font-bold text-lg">Buttons</AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Button Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {buttonVariants.map((variant) => (
                            <div key={variant} className="flex flex-col items-center">
                              <Button 
                                variant={variant as any} 
                                className="mb-2 w-full"
                                onClick={() => copyToClipboard(`variant="${variant}"`)}
                              >
                                {variant}
                              </Button>
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{variant}</code>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-6" />
                        
                        <div>
                          <h4 className="font-bold mb-4">Button Sizes</h4>
                          <div className="flex flex-wrap gap-4">
                            {buttonSizes.map((size) => (
                              <div key={size} className="flex items-center gap-2">
                                <Button 
                                  size={size as any}
                                  onClick={() => copyToClipboard(`size="${size}"`)}
                                >
                                  {size}
                                </Button>
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">size="{size}"</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cards">
                <AccordionTrigger className="font-bold text-lg">Cards</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      className="neo-card p-4 cursor-pointer"
                      onClick={() => copyToClipboard("neo-card")}
                    >
                      <h3 className="font-bold">Neo Card</h3>
                      <p className="text-sm mt-2">Standard neo-brutalist card with shadow</p>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 block">className="neo-card"</code>
                    </div>
                    
                    <div 
                      className="playful-card cursor-pointer"
                      onClick={() => copyToClipboard("playful-card")}
                    >
                      <h3 className="font-bold">Playful Card</h3>
                      <p className="text-sm mt-2">Card with interactive hover animation</p>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 block">className="playful-card"</code>
                    </div>
                    
                    <div 
                      className="recipe-card p-4 cursor-pointer"
                      onClick={() => copyToClipboard("recipe-card")}
                    >
                      <h3 className="font-bold">Recipe Card</h3>
                      <p className="text-sm mt-2">Special card for recipe items</p>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 block">className="recipe-card"</code>
                    </div>
                    
                    <div 
                      className="stat-card cheese cursor-pointer"
                      onClick={() => copyToClipboard("stat-card stat-card-cheese")}
                    >
                      <h3 className="font-bold">Stat Card</h3>
                      <p className="text-sm mt-2">Card for displaying statistics</p>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 block">className="stat-card stat-card-cheese"</code>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="forms">
                <AccordionTrigger className="font-bold text-lg">Form Elements</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="example-input">Input</Label>
                      <Input 
                        id="example-input" 
                        placeholder="Example input..." 
                        className="neo-input"
                        onClick={() => copyToClipboard("<Input className=\"neo-input\" />")}
                      />
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">className="neo-input"</code>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="example-select">Select</Label>
                      <Select onValueChange={(val) => copyToClipboard("<Select>")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Option 1</SelectItem>
                          <SelectItem value="2">Option 2</SelectItem>
                          <SelectItem value="3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="example-switch" className="neo-switch" onClick={() => copyToClipboard("className=\"neo-switch\"")} />
                      <Label htmlFor="example-switch">Toggle Switch</Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="accordions">
                <AccordionTrigger className="font-bold text-lg">Accordions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold mb-2">Standard Accordion</h4>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="example">
                          <AccordionTrigger>Example Accordion Item</AccordionTrigger>
                          <AccordionContent>
                            <p>This is the content of the accordion.</p>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 block">&lt;Accordion&gt;&lt;AccordionItem&gt;</code>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="badges">
                <AccordionTrigger className="font-bold text-lg">Badges</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-4">
                    <Badge onClick={() => copyToClipboard("<Badge>Default</Badge>")}>Default</Badge>
                    <Badge variant="secondary" onClick={() => copyToClipboard("<Badge variant=\"secondary\">Secondary</Badge>")}>Secondary</Badge>
                    <Badge variant="outline" onClick={() => copyToClipboard("<Badge variant=\"outline\">Outline</Badge>")}>Outline</Badge>
                    <Badge variant="destructive" onClick={() => copyToClipboard("<Badge variant=\"destructive\">Destructive</Badge>")}>Destructive</Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="avatars">
                <AccordionTrigger className="font-bold text-lg">Avatars</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-4">
                    <Avatar onClick={() => copyToClipboard("<Avatar><AvatarFallback>JD</AvatarFallback></Avatar>")}>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    
                    <Avatar onClick={() => copyToClipboard("<Avatar><AvatarImage /><AvatarFallback>JD</AvatarFallback></Avatar>")}>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="alerts">
                <AccordionTrigger className="font-bold text-lg">Alerts</AccordionTrigger>
                <AccordionContent>
                  <Alert onClick={() => copyToClipboard("<Alert><AlertTitle>Title</AlertTitle><AlertDescription>Description</AlertDescription></Alert>")}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      This is an example alert. Click to copy the code.
                    </AlertDescription>
                  </Alert>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="ai-components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">AI Suggestion Button</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {aiComponents.map((item, index) => (
                        <div key={index} className="flex flex-col gap-2 items-center p-4 border-2 border-dashed border-muted rounded-xl">
                          <div className="mb-4">{item.component}</div>
                          <p className="font-medium text-sm">{item.description}</p>
                          <code 
                            className="text-xs bg-muted px-1 py-0.5 rounded cursor-pointer"
                            onClick={() => copyToClipboard(`<${item.name} />`)}
                          >
                            &lt;{item.name} /&gt;
                          </code>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-muted rounded-xl">
                      <h4 className="font-bold mb-2">Usage</h4>
                      <pre className="text-sm overflow-x-auto p-3 bg-black text-white rounded-md cursor-pointer" onClick={() => copyToClipboard(`import AiSuggestionButton from "@/components/ui/ai-suggestion-button";\n\n<AiSuggestionButton\n  onClick={handleClick}\n  label="AI Suggestions"\n  variant="cheese"\n  isLoading={false}\n/>`)}>
{`import AiSuggestionButton from "@/components/ui/ai-suggestion-button";

<AiSuggestionButton
  onClick={handleClick}
  label="AI Suggestions"
  variant="cheese"
  isLoading={false}
/>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                {colorGroups.map((group, index) => (
                  <div key={index} className="mb-8">
                    <h3 className="font-bold text-lg mb-4">{group.title}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {group.colors.map((color) => (
                        <div 
                          key={color.name}
                          className="flex flex-col cursor-pointer"
                          onClick={() => copyToClipboard(color.value)}
                        >
                          <div 
                            className={`h-16 rounded-lg border-2 border-black ${color.value}`}
                          ></div>
                          <div className="mt-2">
                            <p className="font-medium text-sm">{color.name}</p>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{color.value}</code>
                            <p className="text-xs text-muted-foreground mt-1">{color.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Gradients</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {gradients.map((gradient) => (
                      <div 
                        key={gradient.name}
                        className="flex flex-col cursor-pointer"
                        onClick={() => copyToClipboard(gradient.name)}
                      >
                        <div 
                          className={`h-16 rounded-lg border-2 border-black ${gradient.name}`}
                        ></div>
                        <div className="mt-2">
                          <p className="font-medium text-sm">{gradient.description}</p>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{gradient.name}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Headings</h3>
                    <div className="space-y-4">
                      <div 
                        className="cursor-pointer"
                        onClick={() => copyToClipboard("<h1 className=\"text-4xl font-bold\">Heading 1</h1>")}
                      >
                        <h1 className="text-4xl font-bold">Heading 1</h1>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">text-4xl font-bold</code>
                      </div>
                      
                      <div 
                        className="cursor-pointer"
                        onClick={() => copyToClipboard("<h2 className=\"text-3xl font-bold\">Heading 2</h2>")}
                      >
                        <h2 className="text-3xl font-bold">Heading 2</h2>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">text-3xl font-bold</code>
                      </div>
                      
                      <div 
                        className="cursor-pointer"
                        onClick={() => copyToClipboard("<h3 className=\"text-2xl font-bold\">Heading 3</h3>")}
                      >
                        <h3 className="text-2xl font-bold">Heading 3</h3>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">text-2xl font-bold</code>
                      </div>
                      
                      <div 
                        className="cursor-pointer"
                        onClick={() => copyToClipboard("<h4 className=\"text-xl font-bold\">Heading 4</h4>")}
                      >
                        <h4 className="text-xl font-bold">Heading 4</h4>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">text-xl font-bold</code>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-4">Text Styles</h3>
                    <div className="space-y-4">
                      {typographyStyles.map((style) => (
                        <div 
                          key={style.name}
                          className="cursor-pointer"
                          onClick={() => copyToClipboard(`className="${style.name}"`)}
                        >
                          <div className={style.name}>{style.description}</div>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">{style.name}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="animations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Animations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Animation Classes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {animationClasses.map((anim) => (
                        <div 
                          key={anim.name}
                          className="cursor-pointer p-4 border-2 border-black rounded-lg bg-white"
                          onClick={() => copyToClipboard(anim.name)}
                        >
                          <div className={`w-8 h-8 bg-yellow-400 rounded-full border-2 border-black mb-2 ${anim.name}`}></div>
                          <p className="font-medium text-sm">{anim.description}</p>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">{anim.name}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-4">Interactive Classes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {interactionClasses.map((inter) => (
                        <div 
                          key={inter.name}
                          className={`cursor-pointer p-4 border-2 border-black rounded-lg bg-white ${inter.name}`}
                          onClick={() => copyToClipboard(inter.name)}
                        >
                          <p className="font-medium text-sm">{inter.description}</p>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">{inter.name}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="modals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modals & Dialogs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Dialog Components</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => copyToClipboard("<Dialog><DialogTrigger>...</DialogTrigger><DialogContent>...</DialogContent></Dialog>")}>
                          Show Dialog Example
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-4 border-black rounded-xl">
                        <DialogHeader>
                          <DialogTitle>Example Dialog</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>This is an example dialog with neo-brutalist styling.</p>
                        </div>
                        <Button className="mt-2">
                          Action Button
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-4">Shadow Styles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {shadows.map((shadow) => (
                        <div 
                          key={shadow.name}
                          className={`cursor-pointer p-4 border-4 border-black rounded-lg bg-white ${shadow.name}`}
                          onClick={() => copyToClipboard(shadow.name)}
                        >
                          <p className="font-medium text-sm">{shadow.description}</p>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">{shadow.name}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-4">Toast Notifications</h3>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Example Toast",
                          description: "This is an example toast notification.",
                        });
                        copyToClipboard("toast({ title: \"Title\", description: \"Description\" })");
                      }}
                    >
                      Show Toast Example
                    </Button>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded ml-2">
                      toast(&#123; title: \"Title\", description: \"Description\" &#125;)
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="layouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Container Styles</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {containers.map((container) => (
                        <div 
                          key={container.name}
                          className={`cursor-pointer p-4 ${container.name}`}
                          onClick={() => copyToClipboard(container.name)}
                        >
                          <p className="font-medium">{container.description}</p>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">{container.name}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-4">Section Styles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        className="section-pink cursor-pointer"
                        onClick={() => copyToClipboard("section-pink")}
                      >
                        <h4 className="font-bold">Pink Section</h4>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">section-pink</code>
                      </div>
                      
                      <div 
                        className="section-green cursor-pointer"
                        onClick={() => copyToClipboard("section-green")}
                      >
                        <h4 className="font-bold">Green Section</h4>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">section-green</code>
                      </div>
                      
                      <div 
                        className="section-yellow cursor-pointer"
                        onClick={() => copyToClipboard("section-yellow")}
                      >
                        <h4 className="font-bold">Yellow Section</h4>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">section-yellow</code>
                      </div>
                      
                      <div 
                        className="section-blue cursor-pointer"
                        onClick={() => copyToClipboard("section-blue")}
                      >
                        <h4 className="font-bold">Blue Section</h4>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1">section-blue</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster />
    </MainLayout>
  );
};

export default DesignSystem;

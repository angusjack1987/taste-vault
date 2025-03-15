
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ChevronLeft, Home, Info, Mic, Plus, Star, User, X } from 'lucide-react';

const DesignSystem = () => {
  const [progress, setProgress] = useState(60);
  
  const buttonVariants = [
    { name: 'default', variant: 'default', label: 'Default' },
    { name: 'destructive', variant: 'destructive', label: 'Destructive' },
    { name: 'outline', variant: 'outline', label: 'Outline' },
    { name: 'secondary', variant: 'secondary', label: 'Secondary' },
    { name: 'ghost', variant: 'ghost', label: 'Ghost' },
    { name: 'link', variant: 'link', label: 'Link' },
    { name: 'tomato', variant: 'tomato', label: 'Tomato' },
    { name: 'lettuce', variant: 'lettuce', label: 'Lettuce' },
    { name: 'cheese', variant: 'cheese', label: 'Cheese' },
    { name: 'bread', variant: 'bread', label: 'Bread' },
    { name: 'blueberry', variant: 'blueberry', label: 'Blueberry' },
    { name: 'grape', variant: 'grape', label: 'Grape' },
    { name: 'orange', variant: 'orange', label: 'Orange' },
    { name: 'mint', variant: 'mint', label: 'Mint' },
  ];

  const buttonSizes = [
    { name: 'default', size: 'default', label: 'Default' },
    { name: 'sm', size: 'sm', label: 'Small' },
    { name: 'lg', size: 'lg', label: 'Large' },
    { name: 'icon', size: 'icon', label: <Plus className="h-4 w-4" /> },
    { name: 'xs', size: 'xs', label: 'XS' },
    { name: 'xl', size: 'xl', label: 'XL' },
  ];

  const tailwindColors = [
    { name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' },
    { name: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
    { name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-500' },
    { name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
    { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
    { name: 'Green', bg: 'bg-green-500', text: 'text-green-500' },
    { name: 'Yellow', bg: 'bg-yellow-400', text: 'text-yellow-400' },
    { name: 'Amber', bg: 'bg-amber-200', text: 'text-amber-800' },
    { name: 'Teal', bg: 'bg-teal-400', text: 'text-teal-400' },
  ];

  const themeColors = [
    { name: 'Primary', bg: 'bg-primary', text: 'text-primary' },
    { name: 'Secondary', bg: 'bg-secondary', text: 'text-secondary' },
    { name: 'Accent', bg: 'bg-accent', text: 'text-accent' },
    { name: 'Muted', bg: 'bg-muted', text: 'text-muted-foreground' },
    { name: 'Background', bg: 'bg-background', text: 'text-foreground' },
    { name: 'Destructive', bg: 'bg-destructive', text: 'text-destructive' },
  ];

  const brandedColors = [
    { name: 'Sunshine-500', bg: 'bg-sunshine-500', text: 'text-sunshine-500' },
    { name: 'Sunshine-700', bg: 'bg-sunshine-700', text: 'text-sunshine-700' },
    { name: 'Citrus-500', bg: 'bg-citrus-500', text: 'text-citrus-500' },
    { name: 'Citrus-700', bg: 'bg-citrus-700', text: 'text-citrus-700' },
    { name: 'Seafoam-500', bg: 'bg-seafoam-500', text: 'text-seafoam-500' },
    { name: 'Seafoam-700', bg: 'bg-seafoam-700', text: 'text-seafoam-700' },
    { name: 'Berry-500', bg: 'bg-berry-500', text: 'text-berry-500' },
    { name: 'Berry-700', bg: 'bg-berry-700', text: 'text-berry-700' },
    { name: 'Ocean-500', bg: 'bg-ocean-500', text: 'text-ocean-500' },
    { name: 'Ocean-700', bg: 'bg-ocean-700', text: 'text-ocean-700' },
    { name: 'Charcoal-500', bg: 'bg-charcoal-500', text: 'text-charcoal-500' },
    { name: 'Charcoal-700', bg: 'bg-charcoal-700', text: 'text-charcoal-700' },
  ];

  const gradients = [
    { name: 'Gradient Sunshine', class: 'bg-gradient-sunshine' },
    { name: 'Gradient Citrus', class: 'bg-gradient-citrus' },
    { name: 'Gradient Seafoam', class: 'bg-gradient-seafoam' },
    { name: 'Gradient Ocean', class: 'bg-gradient-ocean' },
    { name: 'Gradient Berry', class: 'bg-gradient-berry' },
    { name: 'Gradient Radial', class: 'bg-gradient-radial from-primary to-secondary' },
  ];

  const animationStyles = [
    { name: 'Float', class: 'animate-float' },
    { name: 'Bounce Light', class: 'animate-bounce-light' },
    { name: 'Text Bounce', class: 'animate-text-bounce' },
    { name: 'Text Shine', class: 'animate-text-shine' },
    { name: 'Pulse Shadow', class: 'animate-pulse-shadow' },
    { name: 'Neo Float', class: 'animate-neo-float' },
    { name: 'Neo Pulse', class: 'animate-neo-pulse' },
    { name: 'Neo Shake', class: 'animate-neo-shake' },
  ];

  const customClasses = [
    { name: 'Neo Card', class: 'neo-card' },
    { name: 'Neo Button', class: 'neo-button' },
    { name: 'Neo Input', class: 'neo-input' },
    { name: 'Recipe Card', class: 'recipe-card' },
    { name: 'Stat Card', class: 'stat-card' },
    { name: 'Stat Card (Tomato)', class: 'stat-card stat-card-tomato' },
    { name: 'Stat Card (Lettuce)', class: 'stat-card stat-card-lettuce' },
    { name: 'Stat Card (Cheese)', class: 'stat-card stat-card-cheese' },
    { name: 'Stat Card (Bread)', class: 'stat-card stat-card-bread' },
    { name: 'Neo Heading', class: 'neo-heading' },
  ];

  const typographyStyles = [
    { name: 'Text Display', class: 'text-display', content: 'Display' },
    { name: 'Text Title', class: 'text-title', content: 'Title' },
    { name: 'Text Subtitle', class: 'text-subtitle', content: 'Subtitle' },
    { name: 'Section Title', class: 'section-title', content: 'Section Title' },
  ];

  const shadowStyles = [
    { name: 'Shadow Neo', class: 'shadow-neo' },
    { name: 'Shadow Vibrant', class: 'shadow-vibrant' },
    { name: 'Shadow Playful', class: 'shadow-playful' },
    { name: 'Shadow Glow', class: 'shadow-glow' },
    { name: 'Shadow Neo Heavy', class: 'shadow-neo-heavy' },
    { name: 'Shadow Neo Medium', class: 'shadow-neo-medium' },
    { name: 'Shadow Neo Light', class: 'shadow-neo-light' },
  ];

  const iconContainers = [
    { name: 'Icon Container', class: 'icon-container', icon: <Home className="h-5 w-5" /> },
    { name: 'Icon Container (Tomato)', class: 'icon-container icon-container-tomato', icon: <Home className="h-5 w-5" /> },
    { name: 'Icon Container (Lettuce)', class: 'icon-container icon-container-lettuce', icon: <Home className="h-5 w-5" /> },
    { name: 'Icon Container (Cheese)', class: 'icon-container icon-container-cheese', icon: <Home className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold">Design System</h1>
        </div>

        <Tabs defaultValue="components" className="w-full mb-20">
          <TabsList className="w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>

          {/* COMPONENTS TAB */}
          <TabsContent value="components" className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Buttons</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {buttonVariants.map((btn) => (
                  <div key={btn.name} className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg">
                    <Button variant={btn.variant as any}>{btn.label}</Button>
                    <span className="text-xs font-mono">{btn.name}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-heading font-bold mt-6">Button Sizes</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {buttonSizes.map((btn) => (
                  <div key={btn.name} className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg">
                    <Button variant="default" size={btn.size as any}>{btn.label}</Button>
                    <span className="text-xs font-mono">{btn.name}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Cards</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Standard Card</CardTitle>
                      <CardDescription>This is a standard card component from Shadcn UI</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Card content goes here.</p>
                    </CardContent>
                    <CardFooter>
                      <Button>Action</Button>
                    </CardFooter>
                  </Card>
                  <span className="text-xs font-mono">Card</span>
                </div>

                <div className="space-y-2">
                  <div className="neo-card">
                    <h3 className="text-xl font-heading font-bold mb-2">Neo Card</h3>
                    <p>This is a neo-brutalist styled card with bold borders and shadows.</p>
                    <Button className="mt-4">Action</Button>
                  </div>
                  <span className="text-xs font-mono">neo-card</span>
                </div>

                <div className="space-y-2">
                  <div className="recipe-card p-4">
                    <h3 className="text-xl font-heading font-bold mb-2">Recipe Card</h3>
                    <p>A specialized card for recipe displays.</p>
                  </div>
                  <span className="text-xs font-mono">recipe-card</span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card stat-card-tomato">
                      <div className="stat-card-icon">32</div>
                      <div className="stat-card-label">Tomatoes</div>
                    </div>
                    <div className="stat-card stat-card-lettuce">
                      <div className="stat-card-icon">18</div>
                      <div className="stat-card-label">Lettuce</div>
                    </div>
                    <div className="stat-card stat-card-cheese">
                      <div className="stat-card-icon">24</div>
                      <div className="stat-card-label">Cheese</div>
                    </div>
                    <div className="stat-card stat-card-bread">
                      <div className="stat-card-icon">12</div>
                      <div className="stat-card-label">Bread</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono">stat-card (with variants)</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Form Elements</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="standard-input">Standard Input</Label>
                    <Input id="standard-input" placeholder="Type here..." />
                    <span className="text-xs font-mono">Input</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neo-input">Neo Input</Label>
                    <input id="neo-input" className="neo-input w-full" placeholder="Type here..." />
                    <span className="text-xs font-mono">neo-input</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Radio Group</Label>
                    <RadioGroup defaultValue="option-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-1" id="option-1" />
                        <Label htmlFor="option-1">Option 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-2" id="option-2" />
                        <Label htmlFor="option-2">Option 2</Label>
                      </div>
                    </RadioGroup>
                    <span className="text-xs font-mono">RadioGroup</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress</Label>
                    <Progress value={progress} className="w-full" />
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(p => Math.max(0, p - 10))}
                      >
                        Decrease
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(p => Math.min(100, p + 10))}
                      >
                        Increase
                      </Button>
                    </div>
                    <span className="text-xs font-mono">Progress</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Interactive Components</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Popover Trigger</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2">
                        <h3 className="font-medium">Popover Content</h3>
                        <p className="text-sm text-muted-foreground">This is a popover component that can be used to display additional information.</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <span className="text-xs font-mono">Popover</span>
                </div>
                
                <div className="space-y-2">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link">Hover over me</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60">
                      <div className="space-y-2">
                        <h3 className="font-medium">Hover Card Content</h3>
                        <p className="text-sm text-muted-foreground">This appears when you hover over the trigger.</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-xs font-mono">HoverCard</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Custom UI Elements</h2>

              <h3 className="text-xl font-heading font-semibold mt-6">Neo-Brutalist Elements</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <button className="neo-button w-full">
                    Neo Button
                  </button>
                  <span className="text-xs font-mono">neo-button</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="neo-heading">Neo Heading</h3>
                  <span className="text-xs font-mono">neo-heading</span>
                </div>
              </div>

              <h3 className="text-xl font-heading font-semibold mt-6">Icon Containers</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {iconContainers.map((container, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={container.class}>
                      {container.icon}
                    </div>
                    <span className="text-xs font-mono">{container.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* COLORS TAB */}
          <TabsContent value="colors" className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Brand Colors</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {themeColors.map((color, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col"
                  >
                    <div className={`h-20 ${color.bg} rounded-t-lg border border-border overflow-hidden`}></div>
                    <div className="p-2 border-b border-l border-r border-border rounded-b-lg">
                      <div className="font-medium">{color.name}</div>
                      <div className={`text-xs font-mono ${color.text}`}>{color.name.toLowerCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Custom Brand Colors</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {brandedColors.map((color, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col"
                  >
                    <div className={`h-20 ${color.bg} rounded-t-lg border border-border overflow-hidden`}></div>
                    <div className="p-2 border-b border-l border-r border-border rounded-b-lg">
                      <div className="font-medium">{color.name}</div>
                      <div className={`text-xs font-mono ${color.text}`}>{color.name.toLowerCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Tailwind Colors</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {tailwindColors.map((color, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col"
                  >
                    <div className={`h-20 ${color.bg} rounded-t-lg border border-border overflow-hidden`}></div>
                    <div className="p-2 border-b border-l border-r border-border rounded-b-lg">
                      <div className="font-medium">{color.name}</div>
                      <div className={`text-xs font-mono ${color.text}`}>{color.bg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Gradients</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {gradients.map((gradient, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col"
                  >
                    <div className={`h-24 ${gradient.class} rounded-t-lg border border-border overflow-hidden`}></div>
                    <div className="p-2 border-b border-l border-r border-border rounded-b-lg">
                      <div className="font-medium">{gradient.name}</div>
                      <div className="text-xs font-mono">{gradient.class}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* TYPOGRAPHY TAB */}
          <TabsContent value="typography" className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Typography Styles</h2>
              <div className="space-y-6">
                {typographyStyles.map((style, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg">
                    <div className={style.class}>{style.content}</div>
                    <div className="text-xs font-mono mt-2">{style.name} - {style.class}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Font Families</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-sans text-xl mb-2">Nunito (Sans)</p>
                  <p className="font-sans">The quick brown fox jumps over the lazy dog. 0123456789</p>
                  <div className="text-xs font-mono mt-2">font-sans</div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-heading text-xl mb-2">Poppins (Heading)</p>
                  <p className="font-heading">The quick brown fox jumps over the lazy dog. 0123456789</p>
                  <div className="text-xs font-mono mt-2">font-heading</div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* UTILITIES TAB */}
          <TabsContent value="utilities" className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Shadow Styles</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {shadowStyles.map((shadow, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`h-24 w-24 bg-white border border-border rounded-lg ${shadow.class} flex items-center justify-center`}>
                      <div className="text-sm">Box</div>
                    </div>
                    <div className="text-xs font-mono mt-2">{shadow.name} - {shadow.class}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Animation Classes</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {animationStyles.map((animation, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`h-16 w-16 bg-white border border-black rounded-lg flex items-center justify-center ${animation.class} shadow-neo-light`}>
                      <Star className="h-8 w-8" />
                    </div>
                    <div className="text-xs font-mono text-center">{animation.name} - {animation.class}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading font-bold border-b-2 border-border pb-2">Layout & Custom Classes</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-heading font-bold mb-2">Page Container</h3>
                  <div className="page-container bg-muted h-32 flex items-center justify-center rounded-lg">
                    <p>Content area</p>
                  </div>
                  <div className="text-xs font-mono mt-2">page-container</div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-heading font-bold mb-2">Animation Utilities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center">
                      <div className="hover-scale bg-white border border-black p-4 rounded-lg">
                        Hover me
                      </div>
                      <div className="text-xs font-mono mt-2">hover-scale</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="hover-lift bg-white border border-black p-4 rounded-lg">
                        Hover me
                      </div>
                      <div className="text-xs font-mono mt-2">hover-lift</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DesignSystem;

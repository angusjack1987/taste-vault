
import React, { useState } from "react";
import { Mic, Plus, Trash2, X } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useFridge, { FridgeItem } from "@/hooks/useFridge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FridgePage = () => {
  const {
    useFridgeItems,
    addItem,
    deleteItem,
    isVoiceRecording,
    startVoiceRecording,
    stopVoiceRecording,
  } = useFridge();
  
  const { data: fridgeItems, isLoading } = useFridgeItems();
  const [newItemName, setNewItemName] = useState("");
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addItem.mutate({ name: newItemName.trim() });
      setNewItemName("");
    }
  };

  const handleVoiceButton = () => {
    if (isVoiceRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const categories = ["All", "Fridge", "Pantry", "Freezer"];
  
  return (
    <MainLayout title="My Fridge" showBackButton>
      <div className="page-container max-w-2xl mx-auto px-4 pb-20">
        <Tabs defaultValue="All" className="w-full">
          <div className="sticky top-[73px] z-10 bg-background pt-4 pb-2">
            <TabsList className="w-full rounded-full bg-muted">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="flex-1 rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="space-y-6">
                {/* Add item form */}
                <form onSubmit={handleAddItem} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Add item to your fridge..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full rounded-full"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!newItemName.trim()}
                    className="rounded-full bg-primary text-primary-foreground h-10 w-10"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleVoiceButton}
                    variant={isVoiceRecording ? "destructive" : "outline"}
                    size="icon"
                    className="relative rounded-full h-10 w-10"
                  >
                    <Mic className="h-5 w-5" />
                    {isVoiceRecording && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </Button>
                </form>
                
                {isVoiceRecording && (
                  <div className="bg-secondary/20 p-4 rounded-xl text-center">
                    <p className="mb-2 text-sm">Recording... Speak clearly to add items</p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={stopVoiceRecording}
                      className="gap-1 rounded-full"
                    >
                      <X className="h-4 w-4" /> Stop Recording
                    </Button>
                  </div>
                )}
                
                {/* Items list */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">
                      {category === "All" ? "All Items" : `${category} Items`}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {fridgeItems?.filter(item => 
                        category === "All" || 
                        (item.category || "Fridge") === category
                      ).length || 0} items
                    </span>
                  </div>
                  
                  {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading items...</div>
                  ) : fridgeItems?.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No items added yet. Add items using the form above.
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-360px)]">
                      <div className="space-y-2 pr-4">
                        {fridgeItems
                          ?.filter(item => 
                            category === "All" || 
                            (item.category || "Fridge") === category
                          )
                          .map((item) => (
                            <FridgeItemCard 
                              key={item.id} 
                              item={item} 
                              onDelete={() => deleteItem.mutate(item.id)} 
                            />
                          ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

const FridgeItemCard = ({ 
  item, 
  onDelete 
}: { 
  item: FridgeItem; 
  onDelete: () => void;
}) => {
  return (
    <Card className="overflow-hidden border-border rounded-xl hover:shadow-sm transition-all">
      <CardContent className="p-3 flex justify-between items-center">
        <div>
          <p className="font-bold">{item.name}</p>
          {item.quantity && (
            <p className="text-sm text-muted-foreground">{item.quantity}</p>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete}
          className="rounded-full h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default FridgePage;

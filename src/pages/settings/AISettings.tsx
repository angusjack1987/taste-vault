
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

interface AISettings {
  model: string;
  temperature: number;
  promptHistoryEnabled: boolean;
  userPreferences: {
    responseStyle: "concise" | "balanced" | "detailed";
  };
}

interface PromptHistoryItem {
  id: string;
  timestamp: string;
  endpoint: string;
  prompt: string;
  response_preview: string;
}

const AISettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings>({
    model: "gpt-4o-mini",
    temperature: 0.7,
    promptHistoryEnabled: true,
    userPreferences: {
      responseStyle: "balanced"
    }
  });
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptHistoryItem | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "history" | "advanced">("general");

  // Fetch existing settings
  useEffect(() => {
    if (!user) return;
    
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.preferences?.ai) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...data.preferences.ai
          }));
        }
      } catch (err) {
        console.error("Error fetching AI settings:", err);
      }
    };
    
    fetchSettings();
  }, [user]);

  // Fetch prompt history
  useEffect(() => {
    if (activeTab !== "history" || !settings.promptHistoryEnabled || !user) return;
    
    const fetchPromptHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_prompt_history')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        setPromptHistory(data || []);
      } catch (err) {
        console.error("Error fetching prompt history:", err);
        toast.error("Failed to load prompt history");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    
    fetchPromptHistory();
  }, [activeTab, settings.promptHistoryEnabled, user]);

  const saveSettings = async () => {
    if (!user) return;
    
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const currentPreferences = existingData?.preferences || {};
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: {
            ...currentPreferences,
            ai: settings
          }
        });
        
      if (error) throw error;
      
      toast.success("AI settings saved successfully");
    } catch (err) {
      console.error("Error saving AI settings:", err);
      toast.error("Failed to save settings");
    }
  };
  
  // Helper function to describe temperature setting
  const getTemperatureDescription = (temp: number) => {
    if (temp <= 0.3) return "More accurate, less creative";
    if (temp <= 0.6) return "Balanced accuracy and creativity";
    return "More creative, less predictable";
  };

  return (
    <MainLayout 
      title="AI Settings" 
      showBackButton={true}
      showUserMenu={true}
    >
      <div className="container max-w-4xl mx-auto pb-20">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Configure how the AI assistant behaves and responds to your requests
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <ToggleGroup 
                type="single" 
                value={activeTab} 
                onValueChange={(value) => value && setActiveTab(value as any)}
                className="justify-start border-b"
              >
                <ToggleGroupItem value="general" className="rounded-none data-[state=on]:border-b-2 data-[state=on]:border-primary">
                  General
                </ToggleGroupItem>
                <ToggleGroupItem value="history" className="rounded-none data-[state=on]:border-b-2 data-[state=on]:border-primary">
                  Prompt History
                </ToggleGroupItem>
                <ToggleGroupItem value="advanced" className="rounded-none data-[state=on]:border-b-2 data-[state=on]:border-primary">
                  Advanced
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Model Selection</h3>
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">OpenAI Model</Label>
                    <Select 
                      value={settings.model} 
                      onValueChange={(value) => setSettings({...settings, model: value})}
                    >
                      <SelectTrigger id="ai-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (Most Powerful)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Response Style</h3>
                  <div className="space-y-2">
                    <Label>Preferred level of detail</Label>
                    <RadioGroup 
                      value={settings.userPreferences.responseStyle}
                      onValueChange={(value) => 
                        setSettings({
                          ...settings, 
                          userPreferences: {
                            ...settings.userPreferences,
                            responseStyle: value as "concise" | "balanced" | "detailed"
                          }
                        })
                      }
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="concise" id="concise" />
                        <Label htmlFor="concise">Concise (Brief responses)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="balanced" id="balanced" />
                        <Label htmlFor="balanced">Balanced (Moderate detail)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="detailed" id="detailed" />
                        <Label htmlFor="detailed">Detailed (Comprehensive information)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Creativity vs Accuracy</h3>
                    <span className="text-sm text-muted-foreground">{getTemperatureDescription(settings.temperature)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>More Accurate</span>
                      <span>More Creative</span>
                    </div>
                    <Slider 
                      value={[settings.temperature * 10]} 
                      min={0} 
                      max={10} 
                      step={1}
                      onValueChange={(value) => setSettings({...settings, temperature: value[0] / 10})}
                      className="my-2"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={saveSettings}>Save Settings</Button>
                </div>
              </div>
            )}
            
            {activeTab === "history" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Prompt History</h3>
                  <Toggle 
                    pressed={settings.promptHistoryEnabled}
                    onPressedChange={(value) => {
                      setSettings({...settings, promptHistoryEnabled: value});
                      if (!value) {
                        setPromptHistory([]);
                      }
                    }}
                  >
                    {settings.promptHistoryEnabled ? "Enabled" : "Disabled"}
                  </Toggle>
                </div>
                
                {settings.promptHistoryEnabled ? (
                  <>
                    {isHistoryLoading ? (
                      <div className="text-center py-8">Loading history...</div>
                    ) : promptHistory.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-muted px-4 py-2 font-medium">Recent Prompts</div>
                          <ScrollArea className="h-[400px]">
                            <div className="p-2">
                              {promptHistory.map((item) => (
                                <button
                                  key={item.id}
                                  className={`w-full text-left p-3 rounded-md transition-colors hover:bg-secondary/10 mb-1 ${selectedPrompt?.id === item.id ? 'bg-secondary/20' : ''}`}
                                  onClick={() => setSelectedPrompt(item)}
                                >
                                  <div className="font-medium truncate">{item.endpoint}</div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {new Date(item.timestamp).toLocaleString()}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-muted px-4 py-2 font-medium">Prompt Details</div>
                          {selectedPrompt ? (
                            <ScrollArea className="h-[400px]">
                              <div className="p-4 space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Endpoint</h4>
                                  <p>{selectedPrompt.endpoint}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Timestamp</h4>
                                  <p>{new Date(selectedPrompt.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Prompt</h4>
                                  <pre className="text-sm mt-1 whitespace-pre-wrap bg-muted p-2 rounded">
                                    {selectedPrompt.prompt}
                                  </pre>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Response Preview</h4>
                                  <pre className="text-sm mt-1 whitespace-pre-wrap bg-muted p-2 rounded">
                                    {selectedPrompt.response_preview}
                                  </pre>
                                </div>
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="p-8 text-center text-muted-foreground">
                              Select a prompt to view details
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No prompt history available yet.
                      </div>
                    )}
                    
                    <div className="mt-4 text-sm text-muted-foreground flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Prompt history is stored locally and helps improve your recipe suggestions.
                    </div>
                  </>
                ) : (
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p>Prompt history is currently disabled.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable this feature to see a record of your past AI interactions.
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button onClick={saveSettings}>Save Settings</Button>
                </div>
              </div>
            )}
            
            {activeTab === "advanced" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Model Settings</h3>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-sm">
                      These settings allow fine control over the AI's behavior. Changes will affect all recipe suggestions and AI-generated content.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (Creativity): {settings.temperature.toFixed(1)}</Label>
                    <Slider 
                      id="temperature"
                      value={[settings.temperature * 10]} 
                      min={0} 
                      max={10} 
                      step={1}
                      onValueChange={(value) => setSettings({...settings, temperature: value[0] / 10})}
                    />
                    <p className="text-sm text-muted-foreground">{getTemperatureDescription(settings.temperature)}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={saveSettings}>Save Settings</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AISettings;


import React, { useState } from "react";
import { ChevronDown, InfoIcon, Trash, History, Sparkles, Server, Brain } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import useAISettings, { PromptHistoryItem } from "@/hooks/useAISettings";
import { AISettings as AISettingsType } from "@/hooks/useAiRecipes";
import { format } from "date-fns";
import AiMemoryDialog from "@/components/meal-plan/dialogs/AiMemoryDialog";

const modelOptions = [
  { value: "gpt-4o", label: "GPT-4o (Most Capable)" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Faster)" },
];

const AISettings = () => {
  const { user } = useAuth();
  const { 
    useAISettingsQuery, 
    useUpdateAISettings,
    usePromptHistoryQuery,
    useClearPromptHistory
  } = useAISettings();
  
  const { data: aiSettings, isLoading: settingsLoading } = useAISettingsQuery();
  const { data: promptHistory, isLoading: historyLoading } = usePromptHistoryQuery();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateAISettings();
  const { mutate: clearHistory, isPending: isClearing } = useClearPromptHistory();
  
  const [aiMemoryOpen, setAiMemoryOpen] = useState(false);
  
  // Local state for form values
  const [localSettings, setLocalSettings] = useState<AISettingsType>({
    model: aiSettings?.model || "gpt-3.5-turbo",
    temperature: aiSettings?.temperature || 0.7,
    promptHistoryEnabled: aiSettings?.promptHistoryEnabled ?? true,
    useMemory: aiSettings?.useMemory ?? true,
    userPreferences: {
      responseStyle: aiSettings?.userPreferences?.responseStyle || "balanced"
    }
  });
  
  // Update local state when data is loaded
  React.useEffect(() => {
    if (aiSettings) {
      setLocalSettings({
        model: aiSettings.model || "gpt-3.5-turbo",
        temperature: aiSettings.temperature || 0.7,
        promptHistoryEnabled: aiSettings.promptHistoryEnabled ?? true,
        useMemory: aiSettings.useMemory ?? true,
        userPreferences: {
          responseStyle: aiSettings.userPreferences?.responseStyle || "balanced"
        }
      });
    }
  }, [aiSettings]);
  
  const handleSaveSettings = () => {
    updateSettings(localSettings, {
      onSuccess: () => {
        toast.success("AI settings saved successfully");
      }
    });
  };
  
  const handleClearHistory = () => {
    clearHistory(undefined, {
      onSuccess: () => {
        toast.success("Prompt history cleared");
      }
    });
  };
  
  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return timestamp;
    }
  };
  
  const getModelLabel = (modelValue: string) => {
    const model = modelOptions.find(m => m.value === modelValue);
    return model ? model.label : modelValue;
  };
  
  return (
    <MainLayout title="AI Settings" showBackButton>
      <div className="space-y-6 pb-8">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Model Settings</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Prompt History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Preferences</CardTitle>
                <CardDescription>
                  Configure how the AI responds to your queries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Model</label>
                    <span className="text-xs text-muted-foreground">Affects capabilities and speed</span>
                  </div>
                  <Select 
                    value={localSettings.model}
                    onValueChange={(value) => setLocalSettings({...localSettings, model: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Response Temperature</label>
                    <span className="text-xs text-muted-foreground">
                      {localSettings.temperature && localSettings.temperature < 0.4 ? "More accurate" : 
                       localSettings.temperature && localSettings.temperature > 0.7 ? "More creative" : "Balanced"}
                    </span>
                  </div>
                  <Slider 
                    value={[localSettings.temperature || 0.7]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setLocalSettings({...localSettings, temperature: value[0]})}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Accurate</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Response Style</label>
                  </div>
                  <Select 
                    value={localSettings.userPreferences?.responseStyle}
                    onValueChange={(value) => setLocalSettings({
                      ...localSettings, 
                      userPreferences: {
                        ...localSettings.userPreferences,
                        responseStyle: value as "concise" | "balanced" | "detailed"
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Save Prompt History</label>
                      <p className="text-xs text-muted-foreground">Store prompts for future reference</p>
                    </div>
                    <Switch
                      checked={localSettings.promptHistoryEnabled}
                      onCheckedChange={(checked) => 
                        setLocalSettings({...localSettings, promptHistoryEnabled: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">AI Memory</label>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setAiMemoryOpen(true)}
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Use your recipe history to personalize AI suggestions</p>
                    </div>
                    <Switch
                      checked={localSettings.useMemory}
                      onCheckedChange={(checked) => 
                        setLocalSettings({...localSettings, useMemory: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={isUpdating}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Prompt History</CardTitle>
                  <CardDescription>
                    Review your recent AI interactions
                  </CardDescription>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={!promptHistory?.length || isClearing}>
                      <Trash className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your entire prompt history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading prompt history...
                  </div>
                ) : !promptHistory?.length ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No prompt history found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {promptHistory.map((item: PromptHistoryItem) => (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Server className="h-3 w-3" />
                            <span>{item.endpoint}</span>
                            {item.model && (
                              <>
                                <span>•</span>
                                <span>{getModelLabel(item.model)}</span>
                              </>
                            )}
                            {item.temperature && (
                              <>
                                <span>•</span>
                                <span>Temp: {item.temperature}</span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Prompt:</h4>
                            <p className="whitespace-pre-wrap text-sm">{item.prompt}</p>
                          </div>
                          
                          {item.response_preview && (
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground">Response:</h4>
                              <p className="whitespace-pre-wrap text-sm">{item.response_preview}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AiMemoryDialog
        open={aiMemoryOpen}
        onOpenChange={setAiMemoryOpen}
      />
    </MainLayout>
  );
};

export default AISettings;

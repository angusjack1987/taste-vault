
import React, { useState, useCallback } from "react";
import { 
  Eye, 
  EyeOff, 
  Server,
  RefreshCw, 
  Search,
  Terminal,
  Code,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";

const PROMPT_ENDPOINTS = [
  {
    id: "generate-recipe-from-fridge",
    name: "Fridge Recipe Generator",
    description: "Generate recipes from fridge ingredients",
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: "ai-recipe-suggestions",
    name: "Recipe Suggestions",
    description: "Suggest recipes based on preferences",
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: "enhance-recipe-instructions",
    name: "Recipe Instructions Enhancer",
    description: "Enhance recipe instructions with tips",
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: "generate-baby-food",
    name: "Baby Food Generator",
    description: "Generate baby food recipes",
    icon: <MessageSquare className="h-4 w-4" />
  }
];

interface BackendPrompt {
  id: string;
  endpoint: string;
  timestamp: string;
  prompt: string;
  full_response?: string | null;
  model?: string | null;
}

const DevToolsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<BackendPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<BackendPrompt | null>(null);
  const { user } = useAuth();
  
  const handleToggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
    if (!isVisible) {
      fetchPromptsForEndpoint(null);
    }
  }, [isVisible]);
  
  const fetchPromptsForEndpoint = useCallback(async (endpoint: string | null) => {
    if (!user) return;
    
    setIsLoading(true);
    setSelectedEndpoint(endpoint);
    
    try {
      let query = supabase
        .from('ai_prompt_history')
        .select('id, endpoint, timestamp, prompt, full_response, model')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (endpoint) {
        query = query.eq('endpoint', endpoint);
      }
      
      if (searchQuery) {
        query = query.ilike('prompt', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setPrompts(data as BackendPrompt[] || []);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchQuery]);
  
  const handleSearch = useCallback(() => {
    fetchPromptsForEndpoint(selectedEndpoint);
  }, [fetchPromptsForEndpoint, selectedEndpoint]);
  
  const formatJSON = useCallback((jsonString: string | null | undefined) => {
    if (!jsonString) return "No data available";
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  }, []);
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full shadow-md" 
          onClick={handleToggleVisibility}
        >
          <Terminal className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Developer Tools
              <Badge variant="outline" className="ml-2">Alpha</Badge>
            </CardTitle>
            <CardDescription>
              Advanced tools for developers to inspect AI prompts and responses
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleToggleVisibility}>
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex flex-col overflow-hidden h-full space-y-4 pb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button 
              variant="secondary" 
              onClick={handleSearch}
              className="gap-1"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fetchPromptsForEndpoint(selectedEndpoint)}
              className="gap-1 ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-4 h-full overflow-hidden">
            <div className="col-span-1 border rounded-md overflow-hidden">
              <div className="font-medium p-2 bg-muted text-sm">Endpoints</div>
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="p-1">
                  <Button
                    variant={selectedEndpoint === null ? "default" : "ghost"}
                    className="w-full justify-start text-left font-normal mb-1"
                    onClick={() => fetchPromptsForEndpoint(null)}
                  >
                    <Server className="h-4 w-4 mr-2" />
                    All Endpoints
                  </Button>
                  
                  {PROMPT_ENDPOINTS.map((endpoint) => (
                    <Button
                      key={endpoint.id}
                      variant={selectedEndpoint === endpoint.id ? "default" : "ghost"}
                      className="w-full justify-start text-left font-normal mb-1"
                      onClick={() => fetchPromptsForEndpoint(endpoint.id)}
                    >
                      {endpoint.icon}
                      <span className="ml-2 truncate">{endpoint.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="col-span-4 border rounded-md flex flex-col overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Loading prompts...</p>
                </div>
              ) : prompts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Terminal className="h-12 w-12 mb-2 opacity-20" />
                  <p>No prompts found</p>
                  <p className="text-sm">Try another endpoint or search term</p>
                </div>
              ) : selectedPrompt ? (
                <Tabs defaultValue="prompt" className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-2 bg-muted">
                    <TabsList>
                      <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedPrompt(null)}
                      className="h-8"
                    >
                      Back to List
                    </Button>
                  </div>
                  
                  <TabsContent value="prompt" className="flex-grow m-0 overflow-hidden">
                    <ScrollArea className="h-full p-3">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{selectedPrompt.prompt}</pre>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="response" className="flex-grow m-0 overflow-hidden">
                    <ScrollArea className="h-full p-3">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {formatJSON(selectedPrompt.full_response)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  <div className="font-medium p-2 bg-muted text-sm flex justify-between items-center">
                    <span>
                      Prompts {selectedEndpoint ? `for ${PROMPT_ENDPOINTS.find(e => e.id === selectedEndpoint)?.name || selectedEndpoint}` : '(All Endpoints)'}
                    </span>
                    <span className="text-xs text-muted-foreground">{prompts.length} results</span>
                  </div>
                  <ScrollArea className="h-[calc(100%-2rem)]">
                    <div className="divide-y">
                      {prompts.map((prompt) => (
                        <Collapsible key={prompt.id} className="px-3 py-2 hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{prompt.endpoint}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(prompt.timestamp).toLocaleString()}
                                {prompt.model && ` • ${prompt.model}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPrompt(prompt)}
                                className="h-8"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Terminal className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className="mt-2">
                            <div className="bg-muted rounded-md p-2 max-h-40 overflow-auto">
                              <pre className="text-xs whitespace-pre-wrap font-mono">{prompt.prompt.substring(0, 500)}{prompt.prompt.length > 500 ? '...' : ''}</pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevToolsSection;

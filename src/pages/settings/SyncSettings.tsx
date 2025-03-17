import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Share, ArrowLeft, Copy, Check, RefreshCw, UserPlus, Users } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import useSync from "@/hooks/useSync";
import { SharingPreferences } from "@/hooks/recipes/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SyncSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    useSharingPreferencesQuery,
    useUpdateSharingPreferences,
    useConnectWithUser,
    useConnectedUsersQuery,
    useSyncWithAllUsers
  } = useSync();
  
  const { data: sharingPreferences } = useSharingPreferencesQuery();
  const { data: connectedUsers, isLoading: isLoadingConnections } = useConnectedUsersQuery();
  const updateSharingPrefsMutation = useUpdateSharingPreferences();
  const connectWithUserMutation = useConnectWithUser();
  const syncWithAllUsersMutation = useSyncWithAllUsers();
  
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [recipientToken, setRecipientToken] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingPrefs, setSharingPrefs] = useState<SharingPreferences>({
    recipes: true,
    babyRecipes: true,
    fridgeItems: false,
    shoppingList: false,
    mealPlan: true
  });

  useEffect(() => {
    if (user) {
      fetchShareToken();
    }
  }, [user]);

  useEffect(() => {
    if (sharingPreferences) {
      setSharingPrefs(sharingPreferences);
    }
  }, [sharingPreferences]);

  const fetchShareToken = async () => {
    try {
      console.log("Fetching share token for user:", user?.id);
      const { data, error } = await supabase
        .from('share_tokens')
        .select('token')
        .eq('user_id', user?.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching share token:', error);
        toast.error("Error fetching share token: " + error.message);
        return;
      }
      
      console.log('Share token data:', data);
      
      if (data?.token) {
        console.log('Found existing share token:', data.token);
        setShareToken(data.token);
      } else {
        console.log('No share token found for user');
      }
    } catch (error) {
      console.error('Error fetching share token:', error);
      toast.error("Error fetching share token");
    }
  };

  const generateShareToken = async () => {
    if (!user) return;
    try {
      setIsGenerating(true);
      const newToken = uuidv4().substring(0, 12); // Generate a shorter token for easier sharing
      console.log('Generating new share token:', newToken);
      
      const { data: existingToken, error: checkError } = await supabase
        .from('share_tokens')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingToken) {
        result = await supabase
          .from('share_tokens')
          .update({ token: newToken })
          .eq('id', existingToken.id)
          .select('token')
          .single();
      } else {
        result = await supabase
          .from('share_tokens')
          .insert({ user_id: user.id, token: newToken })
          .select('token')
          .single();
      }
      
      const { data, error } = result;
        
      if (error) {
        console.error('Error updating share token:', error);
        toast.error("Failed to generate share token: " + error.message);
        return;
      }
      
      console.log('Token updated response:', data);
      setShareToken(newToken);
      toast.success("Share token generated successfully");
    } catch (error) {
      console.error('Error generating share token:', error);
      toast.error("Failed to generate share token");
    } finally {
      setIsGenerating(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    try {
      updateSharingPrefsMutation.mutate(sharingPrefs, {
        onSuccess: () => {
          toast.success("Sharing preferences saved");
        },
        onError: (error) => {
          console.error('Error saving preferences:', error);
          toast.error("Failed to save preferences");
        }
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save preferences");
    }
  };

  const connectWithToken = async () => {
    if (!user || !recipientToken) {
      toast.error("Please enter a valid token");
      return;
    }
    
    console.log('Attempting to connect with token:', recipientToken);
    
    connectWithUserMutation.mutate(recipientToken, {
      onSuccess: (successful) => {
        if (successful) {
          toast.success("Successfully connected with user");
          setRecipientToken("");
        }
      },
      onError: (error) => {
        console.error('Error connecting with token:', error);
        toast.error("Failed to connect with user: " + (error instanceof Error ? error.message : String(error)));
      }
    });
  };

  const triggerSync = () => {
    syncWithAllUsersMutation.mutate();
  };

  const copyShareToken = () => {
    if (!shareToken) return;
    navigator.clipboard.writeText(shareToken).then(() => {
      setCopied(true);
      toast.success("Share token copied to clipboard");
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  return (
    <MainLayout title="Sync with Others">
      <div className="container max-w-4xl pb-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>

        <Card className="mb-6 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Sync & Share</CardTitle>
                <CardDescription>
                  Share your data with friends and family
                </CardDescription>
              </div>
              <Button 
                onClick={triggerSync} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={syncWithAllUsersMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 ${syncWithAllUsersMutation.isPending ? 'animate-spin' : ''}`} />
                {syncWithAllUsersMutation.isPending ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="connected" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="connected" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Connected Users
                </TabsTrigger>
                <TabsTrigger value="connect" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Connect
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="connected">
                {isLoadingConnections ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : connectedUsers && connectedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {connectedUsers.map(user => (
                      <div key={user.id} className="p-3 border rounded flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            {user.avatar_url ? (
                              <AvatarImage src={user.avatar_url} alt={user.first_name || "User"} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{user.first_name || 'Connected User'}</span>
                            <div className="text-xs text-muted-foreground">
                              Connected since {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>You aren't connected with any users yet</p>
                    <p className="text-sm mt-1">Switch to the Connect tab to get started</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="connect">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Share Token</h3>
                    <p className="text-sm text-muted-foreground">Generate a token to allow others to connect with you</p>
                    
                    {shareToken ? (
                      <div>
                        <div className="flex space-x-2">
                          <Input readOnly value={shareToken} className="font-mono text-sm" />
                          <Button onClick={copyShareToken} variant="outline" size="icon">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button 
                            onClick={generateShareToken} 
                            disabled={isGenerating} 
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {isGenerating ? "Generating..." : "Regenerate"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={generateShareToken} 
                        disabled={isGenerating} 
                        className="w-full"
                      >
                        {isGenerating ? "Generating..." : "Generate Share Token"}
                      </Button>
                    )}
                    
                    <Separator className="my-4" />
                    
                    <h3 className="font-medium">Connect with Others</h3>
                    <p className="text-sm text-muted-foreground">Enter someone else's share token to connect with them</p>
                    
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Paste share token here" 
                        value={recipientToken} 
                        onChange={e => setRecipientToken(e.target.value)} 
                        className="font-mono" 
                      />
                      <Button 
                        onClick={connectWithToken} 
                        disabled={!recipientToken || connectWithUserMutation.isPending}
                      >
                        {connectWithUserMutation.isPending ? "Connecting..." : "Connect"}
                      </Button>
                    </div>
                    {connectWithUserMutation.isError && (
                      <p className="text-sm text-red-500 mt-1">
                        Failed to connect. Please check the token and try again.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Share className="h-5 w-5 mr-2" />
              Sharing Preferences
            </CardTitle>
            <CardDescription>
              Choose what you want to share with other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="recipes" checked={sharingPrefs.recipes} onCheckedChange={checked => setSharingPrefs({
                ...sharingPrefs,
                recipes: !!checked
              })} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="recipes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Recipes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share all your recipes with the connected user
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="babyRecipes" checked={sharingPrefs.babyRecipes} onCheckedChange={checked => setSharingPrefs({
                ...sharingPrefs,
                babyRecipes: !!checked
              })} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="babyRecipes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Baby Food Recipes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share your baby food recipes and profiles
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="fridgeItems" checked={sharingPrefs.fridgeItems} onCheckedChange={checked => setSharingPrefs({
                ...sharingPrefs,
                fridgeItems: !!checked
              })} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="fridgeItems" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Fridge Items
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share your fridge inventory with others
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="shoppingList" checked={sharingPrefs.shoppingList} onCheckedChange={checked => setSharingPrefs({
                ...sharingPrefs,
                shoppingList: !!checked
              })} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="shoppingList" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Shopping List
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share your shopping list items
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="mealPlan" checked={sharingPrefs.mealPlan} onCheckedChange={checked => setSharingPrefs({
                ...sharingPrefs,
                mealPlan: !!checked
              })} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="mealPlan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Meal Plan
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Share your meal planning calendar
                  </p>
                </div>
              </div>

              <Button 
                onClick={savePreferences} 
                disabled={updateSharingPrefsMutation.isPending} 
                className="w-full mt-4"
              >
                {updateSharingPrefsMutation.isPending ? "SAVING..." : "SAVE PREFERENCES"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SyncSettings;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Share, ArrowLeft, Copy, Check } from "lucide-react";
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
import useSync, { SharingPreferences } from "@/hooks/useSync";
import { Json } from "@/integrations/supabase/types";

const SyncSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    useSharingPreferencesQuery,
    useUpdateSharingPreferences,
    useConnectWithUser
  } = useSync();
  
  const { data: sharingPreferences } = useSharingPreferencesQuery();
  const updateSharingPrefsMutation = useUpdateSharingPreferences();
  const connectWithUserMutation = useConnectWithUser();
  
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [recipientToken, setRecipientToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingPrefs, setSharingPrefs] = useState<SharingPreferences>({
    recipes: true,
    babyRecipes: true,
    fridgeItems: false,
    shoppingList: false,
    mealPlan: true
  });

  // Fetch any existing share token
  useEffect(() => {
    if (user) {
      fetchShareToken();
    }
  }, [user]);

  // Set initial sharing preferences from the query
  useEffect(() => {
    if (sharingPreferences) {
      setSharingPrefs(sharingPreferences);
    }
  }, [sharingPreferences]);

  const fetchShareToken = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('share_token')
        .eq('id', user?.id)
        .single();
        
      if (error) {
        console.error('Error fetching share token:', error);
        return;
      }
      
      if (data?.share_token) {
        console.log('Found existing share token:', data.share_token);
        setShareToken(data.share_token);
      } else {
        console.log('No share token found for user');
      }
    } catch (error) {
      console.error('Error fetching share token:', error);
    }
  };

  // Generate a new share token
  const generateShareToken = async () => {
    if (!user) return;
    try {
      setIsProcessing(true);
      const newToken = uuidv4();
      console.log('Generating new share token:', newToken);
      
      const { error } = await supabase
        .from('profiles')
        .update({ share_token: newToken })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating share token:', error);
        toast.error("Failed to generate share token: " + error.message);
        return;
      }
      
      setShareToken(newToken);
      toast.success("Share token generated successfully");
    } catch (error) {
      console.error('Error generating share token:', error);
      toast.error("Failed to generate share token");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save sharing preferences
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

  // Connect with another user via token
  const connectWithToken = async () => {
    if (!user || !recipientToken) return;
    
    console.log('Attempting to connect with token:', recipientToken);
    
    connectWithUserMutation.mutate(recipientToken, {
      onSuccess: (successful) => {
        if (successful) {
          toast.success("Successfully connected with user");
          setRecipientToken("");
        } else {
          toast.error("Failed to connect with user");
        }
      },
      onError: (error) => {
        console.error('Error connecting with token:', error);
        toast.error("Failed to connect with user: " + (error instanceof Error ? error.message : String(error)));
      }
    });
  };

  // Send invitation by email
  const sendInvitation = async () => {
    if (!user || !targetEmail || !shareToken) return;
    try {
      setIsProcessing(true);

      // This would normally send an email invitation
      // For now, we'll just show a success message with the share token

      toast.success(`Invitation would be sent to ${targetEmail} with your share token`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Failed to send invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy share token to clipboard
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

  return <MainLayout title="Sync with Others">
      <div className="container max-w-4xl pb-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        
        <Card className="mb-6 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Share className="h-5 w-5 mr-2" />
              Share Your Food Library
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="text-xl">Your Share Token</CardTitle>
              <CardDescription>
                Generate a token to allow others to connect with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shareToken ? (
                  <div className="flex space-x-2">
                    <Input readOnly value={shareToken} className="font-mono text-sm" />
                    <Button onClick={copyShareToken} variant="outline" size="icon">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={generateShareToken} 
                    disabled={isProcessing} 
                    className="w-full"
                  >
                    Generate Share Token
                  </Button>
                )}

                {shareToken && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="email">Invite by Email</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="email" 
                          placeholder="friend@example.com" 
                          type="email" 
                          value={targetEmail} 
                          onChange={e => setTargetEmail(e.target.value)} 
                        />
                        <Button 
                          onClick={sendInvitation} 
                          disabled={!targetEmail || isProcessing}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="text-xl">Connect to Others</CardTitle>
              <CardDescription>
                Enter someone else's share token to connect with them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Share Token</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="token" 
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>;
};

export default SyncSettings;

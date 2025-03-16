
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Share2, RefreshCw, Loader2, Users, Link, UserPlus2, DownloadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { v4 as uuidv4 } from 'uuid';
import useSync from "@/hooks/useSync";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ShareProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareProfileDialog = ({ open, onOpenChange }: ShareProfileDialogProps) => {
  const { user } = useAuth();
  const { 
    useConnectWithUser,
    useConnectedUsersQuery,
    useRemoveConnection,
    useSyncData
  } = useSync();
  
  const connectWithUserMutation = useConnectWithUser();
  const removeConnectionMutation = useRemoveConnection();
  const syncDataMutation = useSyncData();
  const { data: connectedUsers, isLoading: isLoadingConnections, refetch: refetchConnections } = useConnectedUsersQuery();
  
  const [copied, setCopied] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectToken, setConnectToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("share");
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (open && user) {
      setIsLoading(true);
      fetchShareToken();
    }
  }, [open, user]);
  
  useEffect(() => {
    if (open && activeTab === "connections" && user) {
      refetchConnections();
    }
  }, [open, activeTab, refetchConnections, user]);
  
  const fetchShareToken = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching share token for user:", user.id);
      const { data, error } = await supabase
        .from('share_tokens')
        .select('token')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching share token:', error);
        toast.error("Error fetching share token: " + error.message);
        return;
      }
      
      console.log("Share token data:", data);
      
      if (data?.token) {
        setShareToken(data.token);
      } else {
        generateShareToken();
      }
    } catch (error) {
      console.error("Error fetching share token:", error);
      toast.error("Error fetching share token");
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateShareToken = async () => {
    if (!user) return;
    
    try {
      setIsGenerating(true);
      const newToken = uuidv4().substring(0, 12);
      console.log("Generating new share token:", newToken);
      
      const { data: existingToken, error: checkError } = await supabase
        .from('share_tokens')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingToken) {
        result = await supabase
          .from('share_tokens')
          .update({ token: newToken, updated_at: new Date().toISOString() })
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
        console.error('Error generating share token:', error);
        toast.error("Failed to generate share token: " + error.message);
        return;
      }
      
      console.log("Token generated and saved:", data);
      setShareToken(newToken);
      toast.success("Share token generated successfully");
    } catch (error) {
      console.error("Error generating share token:", error);
      toast.error("Failed to generate share token");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const regenerateToken = () => {
    if (window.confirm("Are you sure you want to generate a new token? This will invalidate your existing share token.")) {
      generateShareToken();
    }
  };
  
  const copyToClipboard = () => {
    if (!shareToken) return;
    
    navigator.clipboard.writeText(shareToken)
      .then(() => {
        setCopied(true);
        toast.success("Share token copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };
  
  const handleInvitePartner = async () => {
    if (!partnerEmail || !partnerEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!shareToken) {
      toast.error("No share token available. Please try again.");
      return;
    }
    
    setIsSharing(true);
    
    try {
      toast.success(`Invitation sent to ${partnerEmail}`);
      setPartnerEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing profile:", error);
      toast.error("Failed to share profile. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleConnectWithToken = async () => {
    if (!connectToken) {
      toast.error("Please enter a valid token");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      console.log("Attempting to connect with token:", connectToken);
      
      const { data: tokenCheck, error: tokenCheckError } = await supabase
        .from('share_tokens')
        .select('user_id')
        .eq('token', connectToken.trim())
        .maybeSingle();
        
      console.log("Token check result:", tokenCheck, tokenCheckError);
      
      if (tokenCheckError) {
        console.error("Error checking token:", tokenCheckError);
        toast.error("Error checking token: " + tokenCheckError.message);
        setIsConnecting(false);
        return;
      } else if (!tokenCheck) {
        console.error("No user found with this token");
        toast.error("Invalid token. No user found with this token.");
        setIsConnecting(false);
        return;
      }
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', tokenCheck.user_id)
        .maybeSingle();
        
      const username = userProfile?.first_name || 'user';
      
      const success = await connectWithUserMutation.mutateAsync(connectToken);
      
      if (success) {
        toast.success(`Successfully connected with ${username}`);
        setConnectToken("");
        setActiveTab("connections");
        refetchConnections();
      }
    } catch (error) {
      console.error('Error connecting with token:', error);
      toast.error("Failed to connect with user: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveConnection = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove connection with ${userName}?`)) {
      try {
        const success = await removeConnectionMutation.mutateAsync(userId);
        if (success) {
          toast.success(`Connection with ${userName} removed`);
          refetchConnections();
        }
      } catch (error) {
        console.error('Error removing connection:', error);
        toast.error("Failed to remove connection");
      }
    }
  };
  
  const handleSyncWithUser = async (userId: string, userName: string) => {
    setIsSyncing(prev => ({ ...prev, [userId]: true }));
    
    try {
      const success = await syncDataMutation.mutateAsync(userId);
      
      if (success) {
        toast.success(`Successfully synchronized data with ${userName}`);
      } else {
        toast.error(`Failed to sync with ${userName}`);
      }
    } catch (error) {
      console.error('Error syncing with user:', error);
      toast.error(`Failed to sync with ${userName}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSyncing(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  if (isLoading && !shareToken) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect & Share</DialogTitle>
          </DialogHeader>
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2">Loading your share token...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect & Share</DialogTitle>
          <DialogDescription>
            Connect with others to share recipes, meal plans, and more
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="share">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </TabsTrigger>
            <TabsTrigger value="connections" onClick={() => refetchConnections()}>
              <Users className="h-4 w-4 mr-2" />
              Connections
              {connectedUsers && connectedUsers.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {connectedUsers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-token">Your share token</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="share-token"
                  value={isGenerating ? "Generating..." : (shareToken || "No token generated")}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline" 
                  onClick={copyToClipboard}
                  disabled={!shareToken || isGenerating}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Share this token with someone to connect
                </p>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={regenerateToken}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                  {isGenerating ? "Generating..." : "Regenerate"}
                </Button>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="connect-token">Connect with someone's token</Label>
              <div className="flex space-x-2">
                <Input
                  id="connect-token"
                  type="text"
                  placeholder="Enter share token"
                  value={connectToken}
                  onChange={(e) => setConnectToken(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  type="button" 
                  onClick={handleConnectWithToken}
                  disabled={!connectToken || isConnecting}
                >
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Link className="h-4 w-4 mr-1" />}
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              </div>
              {connectWithUserMutation.isError && (
                <p className="text-sm text-red-500 mt-1">
                  Failed to connect. Please check the token and try again.
                </p>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="partner-email">Or invite a partner directly</Label>
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
              />
            </div>
          
            <Button
              type="button"
              onClick={handleInvitePartner}
              disabled={isSharing || !shareToken || isGenerating || !partnerEmail}
              className="w-full"
            >
              {isSharing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
              {isSharing ? "Sending invitation..." : "Invite Partner"}
            </Button>
          </TabsContent>
          
          <TabsContent value="connections">
            {isLoadingConnections ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2">Loading your connections...</span>
              </div>
            ) : connectedUsers && connectedUsers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Users you are connected with:
                </p>
                {connectedUsers.map(user => (
                  <div key={user.id} className="flex flex-col p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary">
                          {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="ml-3 font-medium">{user.first_name || 'Unknown User'}</span>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveConnection(user.id, user.first_name || 'User')}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncWithUser(user.id, user.first_name || 'User')}
                        disabled={isSyncing[user.id]}
                        className="text-xs"
                      >
                        {isSyncing[user.id] ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <DownloadCloud className="h-3 w-3 mr-1" />
                            Sync Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg mb-1">No connections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with others to share your recipes and meal plans
                </p>
                <Button onClick={() => setActiveTab("share")}>
                  <UserPlus2 className="h-4 w-4 mr-2" />
                  Connect with Someone
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;

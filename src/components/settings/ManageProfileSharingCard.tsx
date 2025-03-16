import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

type SyncedProfile = {
  id: string;
  user_id_1: string;
  user_id_2: string;
  profile: {
    first_name: string | null;
  } | null;
  created_at: string;
};

const ManageProfileSharingCard = () => {
  const { user } = useAuth();
  const [syncedProfiles, setSyncedProfiles] = useState<SyncedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<{[key: string]: boolean}>({});

  const fetchSyncedProfiles = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log("Fetching synced profiles for user", user.id);
      
      // Get connections where the current user is either user_id_1 or user_id_2
      const { data, error } = await supabase
        .from('profile_sharing')
        .select(`
          *,
          profile:profiles!profile_sharing_user_id_2_fkey (
            first_name
          )
        `)
        .eq('user_id_1', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Also get connections where current user is user_id_2
      const { data: data2, error: error2 } = await supabase
        .from('profile_sharing')
        .select(`
          *,
          profile:profiles!profile_sharing_user_id_1_fkey (
            first_name
          )
        `)
        .eq('user_id_2', user.id)
        .order('created_at', { ascending: false });

      if (error2) throw error2;
      
      // Combine results
      const allProfiles = [...(data || []), ...(data2 || [])];
      console.log("Fetched synced profiles:", allProfiles);
      setSyncedProfiles(allProfiles);
    } catch (error) {
      console.error("Error fetching synced profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load your synced profiles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectProfile = async (connectionId: string) => {
    if (!user) return;

    setIsRevoking(prev => ({ ...prev, [connectionId]: true }));
    try {
      console.log("Disconnecting profile with connection ID", connectionId);
      const { error } = await supabase
        .from('profile_sharing')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      toast({
        title: "Profile disconnected",
        description: "Profile sync connection removed successfully",
      });
      
      setSyncedProfiles(prev => prev.filter(profile => profile.id !== connectionId));
    } catch (error) {
      console.error("Error disconnecting profile:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect profile",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchSyncedProfiles();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProfileName = (syncedProfile: SyncedProfile) => {
    // If current user is user_id_1, show name of user_id_2's profile
    // Otherwise show name of user_id_1's profile
    if (user?.id === syncedProfile.user_id_1) {
      return syncedProfile.profile?.first_name || 'Unknown User';
    } else {
      return syncedProfile.profile?.first_name || 'Unknown User';
    }
  };

  return (
    <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Synced Profiles</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSyncedProfiles}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : syncedProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>You haven't synced with any other profiles yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile Name</TableHead>
                  <TableHead>Connected Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncedProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{getProfileName(profile)}</TableCell>
                    <TableCell>{formatDate(profile.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => disconnectProfile(profile.id)}
                        disabled={isRevoking[profile.id]}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Disconnect</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageProfileSharingCard;

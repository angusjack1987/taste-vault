
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import useAuth from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

type SharingInvite = {
  id: string;
  shared_with_email: string;
  status: string;
  created_at: string;
};

const ManageProfileSharingCard = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<SharingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<{[key: string]: boolean}>({});

  const fetchInvites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log("Fetching sharing invites for user", user.id);
      
      // Get connections where the current user is the owner
      const { data, error } = await supabase
        .from('profile_sharing')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Fetched invites:", data);
      setInvites(data || []);
    } catch (error) {
      console.error("Error fetching sharing invites:", error);
      toast({
        title: "Error",
        description: "Failed to load your sharing invites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    if (!user) return;

    setIsRevoking(prev => ({ ...prev, [inviteId]: true }));
    try {
      console.log("Revoking invite", inviteId);
      const { error } = await supabase
        .from('profile_sharing')
        .delete()
        .eq('id', inviteId)
        .eq('owner_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Access revoked",
        description: "Profile sharing revoked successfully",
      });
      
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error("Error revoking invite:", error);
      toast({
        title: "Error",
        description: "Failed to revoke sharing access",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(prev => ({ ...prev, [inviteId]: false }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      case 'pending':
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
    }
  };

  return (
    <Card className="border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Profile Sharing</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchInvites}
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
        ) : invites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>You haven't shared your profile with anyone yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shared On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.shared_with_email}</TableCell>
                    <TableCell>{getStatusBadge(invite.status)}</TableCell>
                    <TableCell>{formatDate(invite.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeInvite(invite.id)}
                        disabled={isRevoking[invite.id]}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Revoke</span>
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

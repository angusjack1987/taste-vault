
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ManageProfileSharingCard from "@/components/settings/ManageProfileSharingCard";
import ShareProfileDialog from "@/components/settings/ShareProfileDialog";
import { Button } from "@/components/ui/button";
import { Share2, Info } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ProfileSharing = () => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  return (
    <MainLayout title="Profile Syncing">
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-4 pb-2">
          <h2 className="text-2xl font-bold mb-2">Profile Syncing</h2>
          <p className="text-muted-foreground">
            Sync your profile with friends and family to share recipes, meal plans, and shopping lists in both directions.
          </p>
          
          <Alert className="border-2 border-amber-500 bg-amber-50">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle>Sharing Note</AlertTitle>
            <AlertDescription>
              Share the link with someone you want to sync profiles with. After connecting, all your recipes and meal plans
              will be automatically shared between both accounts.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => setShareDialogOpen(true)}
            className="w-full sm:w-auto rounded-xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Invite Someone to Sync
          </Button>
        </div>
        
        <ManageProfileSharingCard />
      </div>
      
      <ShareProfileDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </MainLayout>
  );
};

export default ProfileSharing;

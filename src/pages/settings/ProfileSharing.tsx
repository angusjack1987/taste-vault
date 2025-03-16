
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ManageProfileSharingCard from "@/components/settings/ManageProfileSharingCard";
import ShareProfileDialog from "@/components/settings/ShareProfileDialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useState } from "react";

const ProfileSharing = () => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  return (
    <MainLayout title="Profile Sharing">
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-4 pb-2">
          <h2 className="text-2xl font-bold mb-2">Profile Sharing</h2>
          <p className="text-muted-foreground">
            Share your profile with friends and family to sync recipes, meal plans, and shopping lists.
          </p>
          
          <Button 
            onClick={() => setShareDialogOpen(true)}
            className="w-full sm:w-auto rounded-xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Invite Someone
          </Button>
        </div>
        
        <ManageProfileSharingCard />
      </div>
      
      <ShareProfileDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </MainLayout>
  );
};

export default ProfileSharing;

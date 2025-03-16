
import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { UserPlus, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useProfileConnection } from "./hooks/useProfileConnection";
import LoadingState from "./components/LoadingState";
import ProfileConnectionCard from "./components/ProfileConnectionCard";

const ConnectProfile = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  console.log("ConnectProfile - Current path:", location.pathname + location.search);
  console.log("ConnectProfile - Token:", token);
  console.log("ConnectProfile - Owner ID:", ownerId);
  console.log("ConnectProfile - User:", user?.id || "Not logged in");
  console.log("ConnectProfile - Auth loading:", authLoading);

  const {
    connectionStatus,
    ownerName,
    isLoading: connectionLoading,
    isConnecting,
    handleConnect
  } = useProfileConnection(ownerId, token, user, navigate);

  useEffect(() => {
    // Log status changes
    console.log("ConnectProfile - Connection status:", connectionStatus);
    console.log("ConnectProfile - Connection loading:", connectionLoading);
    console.log("ConnectProfile - Owner name:", ownerName);
  }, [connectionStatus, connectionLoading, ownerName]);

  // Show loading while waiting for auth to initialize
  if (authLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  const renderContent = () => {
    if (connectionLoading) {
      return <LoadingState message="Checking connection status..." />;
    }

    if (connectionStatus === 'invalid_token') {
      return (
        <ProfileConnectionCard
          title="Invalid or Expired Link"
          description="The sharing link you're using is invalid or has expired. Please ask for a new link."
          primaryButtonProps={{
            label: "Go Home",
            onClick: () => navigate('/')
          }}
        />
      );
    }

    if (connectionStatus === 'not_found') {
      return (
        <ProfileConnectionCard
          title="Profile Not Found"
          description="The profile you're trying to connect with doesn't exist or has been removed."
          primaryButtonProps={{
            label: "Go Home",
            onClick: () => navigate('/')
          }}
        />
      );
    }

    if (connectionStatus === 'self') {
      return (
        <ProfileConnectionCard
          title="This is Your Profile"
          description="You can't connect with your own profile. Share this link with someone else to connect with them."
          primaryButtonProps={{
            label: "Manage Profile Sharing",
            onClick: () => navigate('/settings/profile-sharing')
          }}
        />
      );
    }

    if (connectionStatus === 'connected') {
      return (
        <ProfileConnectionCard
          title="Profiles Synced!"
          description={`You are now synced with ${ownerName}'s profile. You can now share recipes, meal plans, and shopping lists.`}
          primaryButtonProps={{
            label: "Manage Profile Sharing",
            onClick: () => navigate('/settings/profile-sharing')
          }}
        />
      );
    }

    return (
      <ProfileConnectionCard
        title={`Sync with ${ownerName || 'User'}`}
        description={!user 
          ? "Sign in or create an account to sync with this profile." 
          : `Sync with ${ownerName || 'User'}'s profile to share recipes, meal plans, and shopping lists in both directions.`}
        primaryButtonProps={{
          label: user ? "Sync Profiles" : "Sign In",
          onClick: handleConnect,
          isLoading: isConnecting,
          icon: <UserPlus className="mr-2 h-4 w-4" />
        }}
        secondaryButtonProps={{
          label: "Cancel",
          onClick: () => navigate('/'),
          icon: <X className="mr-2 h-4 w-4" />
        }}
      />
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {renderContent()}
    </div>
  );
};

export default ConnectProfile;

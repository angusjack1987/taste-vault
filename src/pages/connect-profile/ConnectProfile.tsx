
import React from "react";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log("ConnectProfile - Current path:", location.pathname + location.search);
  console.log("ConnectProfile - Token:", token);
  console.log("ConnectProfile - Owner ID:", ownerId);

  const {
    connectionStatus,
    ownerName,
    isLoading,
    isConnecting,
    handleConnect
  } = useProfileConnection(ownerId, token, user, navigate);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
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
          title="Profiles Connected!"
          description={`You are connected with ${ownerName}'s profile. You can now share recipes, meal plans, and shopping lists.`}
          primaryButtonProps={{
            label: "Manage Profile Sharing",
            onClick: () => navigate('/settings/profile-sharing')
          }}
        />
      );
    }

    if (connectionStatus === 'pending') {
      return (
        <ProfileConnectionCard
          title="Pending Connection"
          description={`Your connection with ${ownerName}'s profile is pending. Please wait for them to approve it.`}
          primaryButtonProps={{
            label: "View Status",
            onClick: () => navigate('/settings/profile-sharing')
          }}
        />
      );
    }

    return (
      <ProfileConnectionCard
        title={`Connect with ${ownerName}`}
        description={!user 
          ? "Sign in or create an account to connect with this profile." 
          : `Connect with ${ownerName}'s profile to share recipes, meal plans, and shopping lists.`}
        primaryButtonProps={{
          label: user ? "Connect" : "Sign In",
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

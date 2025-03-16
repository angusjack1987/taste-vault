
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, X } from "lucide-react";

interface ProfileConnectionCardProps {
  title: string;
  description: string;
  primaryButtonProps?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    isLoading?: boolean;
  };
  secondaryButtonProps?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const ProfileConnectionCard = ({ 
  title, 
  description, 
  primaryButtonProps, 
  secondaryButtonProps 
}: ProfileConnectionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md border-2 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {primaryButtonProps && (
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={primaryButtonProps.onClick}
            disabled={primaryButtonProps.isLoading}
            className="w-full rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            {primaryButtonProps.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                {primaryButtonProps.icon || null}
                {primaryButtonProps.label}
              </>
            )}
          </Button>
          {secondaryButtonProps && (
            <Button
              variant="outline"
              onClick={secondaryButtonProps.onClick}
              className="w-full sm:w-auto rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              {secondaryButtonProps.icon || null}
              {secondaryButtonProps.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ProfileConnectionCard;

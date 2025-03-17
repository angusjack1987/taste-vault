import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import useAISettings, { PromptHistoryItem } from "@/hooks/useAISettings";

interface PromptDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string | null;
}

const PromptDetailsDialog = ({
  open,
  onOpenChange,
  promptId,
}: PromptDetailsDialogProps) => {
  const { usePromptDetailsQuery } = useAISettings();
  const { data: promptDetails, isLoading } = usePromptDetailsQuery(promptId);

  if (!promptId || !open) {
    return null;
  }

  const formatJSON = (jsonString: string | null | undefined) => {
    if (!jsonString) return "No data available";
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Prompt Details</DialogTitle>
          <DialogDescription>
            Detailed information about this AI interaction
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !promptDetails ? (
          <div className="text-center p-4 text-muted-foreground">
            Prompt details could not be loaded
          </div>
        ) : (
          <Tabs defaultValue="prompt" className="flex-grow flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompt" className="flex-grow overflow-hidden flex flex-col">
              <div className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium">Endpoint:</span> {promptDetails.endpoint}
                {promptDetails.model && (
                  <> • <span className="font-medium">Model:</span> {promptDetails.model}</>
                )}
                {promptDetails.temperature !== null && (
                  <> • <span className="font-medium">Temperature:</span> {promptDetails.temperature}</>
                )}
              </div>
              
              <ScrollArea className="border rounded-md p-4 flex-grow bg-muted/30">
                <pre className="whitespace-pre-wrap text-sm font-mono">{promptDetails.prompt}</pre>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="response" className="flex-grow overflow-hidden flex flex-col">
              <ScrollArea className="border rounded-md p-4 flex-grow bg-muted/30">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {promptDetails.full_response 
                    ? formatJSON(promptDetails.full_response)
                    : promptDetails.response_preview || "No full response available"}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailsDialog;

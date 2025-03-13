
import React, { useState } from "react";
import { Plus, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FridgeAddItemFormProps {
  newItemName: string;
  onNewItemNameChange: (name: string) => void;
  onAddItem: (e: React.FormEvent) => void;
  isVoiceRecording: boolean;
  isProcessingVoice: boolean;
  onVoiceButtonClick: () => void;
}

const FridgeAddItemForm = ({
  newItemName,
  onNewItemNameChange,
  onAddItem,
  isVoiceRecording,
  isProcessingVoice,
  onVoiceButtonClick
}: FridgeAddItemFormProps) => {
  return (
    <form onSubmit={onAddItem} className="flex gap-2 items-start">
      <div className="flex-1">
        <Input
          placeholder="Add item to your fridge..."
          value={newItemName}
          onChange={(e) => onNewItemNameChange(e.target.value)}
          className="w-full rounded-full"
        />
      </div>
      
      <Button 
        type="submit" 
        size="icon" 
        disabled={!newItemName.trim()}
        className="rounded-full bg-primary text-primary-foreground h-10 w-10"
      >
        <Plus className="h-5 w-5" />
      </Button>
      
      <Button
        type="button"
        onClick={onVoiceButtonClick}
        variant={isVoiceRecording ? "destructive" : "outline"}
        size="icon"
        className="relative rounded-full h-10 w-10"
        disabled={isProcessingVoice && !isVoiceRecording}
      >
        {isVoiceRecording ? (
          <Mic className="h-5 w-5 animate-pulse" />
        ) : isProcessingVoice ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        {isVoiceRecording && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        )}
      </Button>
    </form>
  );
};

export default FridgeAddItemForm;

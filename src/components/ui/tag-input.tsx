
import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
  id?: string;
  name?: string;
  onTagsChange?: (tags: string[]) => void;
  preserveFocus?: boolean;
}

const TagInput = ({
  tags,
  setTags,
  placeholder = "Type and press Enter...",
  className,
  onChange,
  id,
  name,
  onTagsChange,
  preserveFocus = false,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If the input ends with a comma, extract the value before the comma
    if (value.endsWith(',')) {
      const newValue = value.slice(0, -1).trim();
      if (newValue) {
        addTag(newValue);
      }
    } else {
      setInputValue(value);
      if (onChange) onChange(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      e.stopPropagation(); // Stop event propagation

      const value = inputValue.trim();
      if (value) {
        addTag(value);
      }

      return false; // Ensure the event is fully canceled
    }
  };

  const addTag = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      const newTags = [...tags, trimmedValue];
      setTags(newTags);
      setInputValue("");
      if (onTagsChange) onTagsChange(newTags);
      
      // Ensure input keeps focus after adding tag
      if (inputRef.current) {
        // We need to clear the input immediately to avoid it being submitted
        inputRef.current.value = "";
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      }
    } else {
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    if (onTagsChange) onTagsChange(newTags);
    
    // Focus the input after removing a tag
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Ensure the form doesn't submit when Enter is pressed in the input
  useEffect(() => {
    const formElement = inputRef.current?.closest('form');
    
    if (formElement) {
      const handleFormSubmit = (e: Event) => {
        const activeElement = document.activeElement;
        if (activeElement === inputRef.current && (inputValue.trim() || inputRef.current?.value.trim())) {
          e.preventDefault();
          // Add the tag if there's a value
          const currentValue = inputRef.current?.value.trim() || inputValue.trim();
          if (currentValue) {
            addTag(currentValue);
          }
        }
      };
      
      formElement.addEventListener('submit', handleFormSubmit);
      
      return () => {
        formElement.removeEventListener('submit', handleFormSubmit);
      };
    }
  }, [inputValue, tags]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm 
                     animate-in fade-in duration-300"
          >
            <TagIcon className="h-3.5 w-3.5 mr-1" />
            <span>{tag}</span>
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <Input
          id={id}
          name={name}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Add tag"
          ref={inputRef}
          autoComplete="off" // Prevent browser autocomplete from interfering
        />
        <Button 
          type="button" 
          variant="secondary" 
          className="ml-2"
          onClick={() => addTag(inputValue)}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default TagInput;

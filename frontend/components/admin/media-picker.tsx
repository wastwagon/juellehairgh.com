"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, Upload } from "lucide-react";
import { AdminMediaLibrary } from "./admin-media-library";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
  title?: string;
}

export function MediaPicker({ onSelect, trigger, title = "Select Media" }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button type="button" variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Choose from Media Library
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{title}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-6">
              <AdminMediaLibrary onSelect={handleSelect} standalone={false} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}


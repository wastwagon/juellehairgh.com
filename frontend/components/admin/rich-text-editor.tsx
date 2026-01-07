"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Youtube, 
  Type,
  Heading1,
  Heading2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = forwardRef<any, RichTextEditorProps>(({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  minHeight = "200px"
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.innerHTML || "",
  }));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Unified effect: Sync value prop to editor content
  useEffect(() => {
    // Wait for editor to be mounted and ref to be available
    if (!isMounted || !editorRef.current) {
      return;
    }
    
    const currentContent = editorRef.current.innerHTML;
    const newValue = value || "";
    
    // Don't update if editor is focused (user is typing)
    if (document.activeElement === editorRef.current) {
      return;
    }
    
    // Normalize both values for comparison
    const normalizedCurrent = currentContent.replace(/\s+/g, ' ').trim();
    const normalizedNew = newValue.replace(/\s+/g, ' ').trim();
    
    // Always update if different (including initial empty state)
    if (normalizedCurrent !== normalizedNew) {
      editorRef.current.innerHTML = newValue;
      // Force a reflow to ensure the update is applied
      void editorRef.current.offsetHeight;
    }
  }, [isMounted, value]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Filter out empty paragraphs that some browsers add
      const cleanContent = content === "<p><br></p>" ? "" : content;
      onChange(cleanContent);
    }
  };

  const handleBlur = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const cleanContent = content === "<p><br></p>" ? "" : content;
      onChange(cleanContent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    // Insert as plain text to strip source site styling
    document.execCommand("insertText", false, text);
  };

  const insertYoutube = () => {
    const url = prompt("Enter YouTube Video URL:");
    if (url) {
      // Just paste the URL, our processDescription will handle it on the frontend
      execCommand("insertHTML", `<p>${url}</p>`);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="border rounded-md bg-white overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("bold")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("italic")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("formatBlock", "h2")}
          className="h-8 w-8 p-0"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("formatBlock", "h3")}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertLink}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={insertYoutube}
          className="h-8 w-8 p-0"
          title="Insert YouTube Video"
        >
          <Youtube className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand("removeFormat")}
          className="h-8 w-8 p-0"
          title="Clear Formatting"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        onPaste={handlePaste}
        className="p-4 focus:outline-none min-h-[200px] product-description-editor prose prose-sm max-w-none"
        style={{ minHeight }}
        placeholder={placeholder}
      />
      
      <style jsx>{`
        .product-description-editor {
          outline: none;
        }
        .product-description-editor:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          cursor: text;
        }
        .product-description-editor p {
          margin-bottom: 1em;
        }
        .product-description-editor ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description-editor ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description-editor b, .product-description-editor strong {
          font-weight: bold;
        }
        .product-description-editor i, .product-description-editor em {
          font-style: italic;
        }
        .product-description-editor h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .product-description-editor h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .product-description-editor a {
          color: #db2777;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";


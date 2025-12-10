"use client";

import { Facebook, Twitter, MessageCircle, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: "default" | "compact";
}

export function SocialShare({ url, title, description, image, variant = "default" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    url,
    title,
    description: description || title,
    image: image || "",
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || title);

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "copy":
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
          return;
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      default:
        // Use Web Share API if available
        if (navigator.share) {
          navigator.share({
            title,
            text: description || title,
            url,
          }).catch(() => {});
          return;
        }
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="h-8 w-8 p-0"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="h-8 w-8 p-0"
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="h-8 w-8 p-0"
          title="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("copy")}
          className="h-8 w-8 p-0"
          title="Copy link"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Share</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          <span>Facebook</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4 text-blue-400" />
          <span>Twitter</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span>WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("copy")}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

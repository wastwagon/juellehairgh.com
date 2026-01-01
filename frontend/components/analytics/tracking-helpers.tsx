/**
 * Analytics Tracking Helpers
 * Auto-tracking for forms, links, buttons, and videos
 */

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

// Auto-track form submissions
export function useFormTracking(formId?: string, formName?: string, formType?: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSubmit = (e: Event) => {
      const target = e.target as HTMLFormElement;
      const id = formId || target.id || target.getAttribute("data-form-id") || "unknown";
      const name = formName || target.getAttribute("data-form-name") || "Contact Form";
      const type = formType || target.getAttribute("data-form-type") || "contact";

      analytics.formSubmit(id, name, type);
    };

    // Track all form submissions
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.addEventListener("submit", handleSubmit);
    });

    return () => {
      forms.forEach((form) => {
        form.removeEventListener("submit", handleSubmit);
      });
    };
  }, [formId, formName, formType]);
}

// Auto-track link clicks
export function useLinkTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        const linkText = link.textContent?.trim() || link.getAttribute("aria-label") || "Link";
        const linkUrl = link.href;
        const linkType = link.getAttribute("data-link-type") || "internal";

        // Don't track internal navigation links (handled by Next.js router)
        if (!linkUrl.startsWith("http") || linkUrl.includes(window.location.hostname)) {
          analytics.linkClick(linkText, linkUrl, linkType);
        }
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);
}

// Auto-track button clicks
export function useButtonTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("button");

      if (button && !button.hasAttribute("data-no-track")) {
        const buttonText = button.textContent?.trim() || button.getAttribute("aria-label") || "Button";
        const buttonId = button.id || button.getAttribute("data-button-id") || undefined;
        const buttonType = button.getAttribute("data-button-type") || button.type || "button";

        analytics.buttonClick(buttonText, buttonId, buttonType);
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);
}

// Auto-track video engagement
export function useVideoTracking(videoId: string, videoTitle?: string, videoUrl?: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const video = document.querySelector(`video[data-video-id="${videoId}"]`) as HTMLVideoElement;
    if (!video) return;

    let progressInterval: NodeJS.Timeout | null = null;
    let hasPlayed = false;

    const handlePlay = () => {
      if (!hasPlayed) {
        analytics.videoPlay(videoId, videoTitle, videoUrl);
        hasPlayed = true;
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const progress = video.currentTime;
        const duration = video.duration;
        analytics.videoProgress(videoId, progress, duration);
      }
    };

    const handleEnded = () => {
      if (video.duration) {
        analytics.videoComplete(videoId, video.duration);
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Track progress every 10 seconds
    progressInterval = setInterval(() => {
      if (video.duration && !video.paused) {
        handleTimeUpdate();
      }
    }, 10000);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [videoId, videoTitle, videoUrl]);
}













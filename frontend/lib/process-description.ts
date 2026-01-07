/**
 * Processes product description HTML to:
 * 1. Convert YouTube URLs to embedded iframes
 * 2. Ensure proper paragraph spacing
 * 3. Preserve other HTML content
 */

function extractYouTubeVideoId(url: string): string | null {
  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function processDescription(html: string): string {
  if (!html) return "";

  let processed = html;

  // First, handle YouTube URLs that might be in anchor tags
  // Replace <a href="youtube-url">text</a> with embedded iframe
  processed = processed.replace(
    /<a[^>]*href=["']([^"']*youtube[^"']*)["'][^>]*>([^<]*)<\/a>/gi,
    (match, url, linkText) => {
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        return `<div class="youtube-embed-wrapper my-4">
          <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe
              class="absolute top-0 left-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/${videoId}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </div>`;
      }
      return match;
    }
  );

  // Handle plain YouTube URLs in text (not in anchor tags)
  const youtubeUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:\S*)?/g;
  
  processed = processed.replace(youtubeUrlPattern, (match, videoId) => {
    // Skip if already processed (inside an iframe or embed wrapper)
    if (match.includes('youtube-embed-wrapper') || match.includes('iframe')) {
      return match;
    }
    
    return `<div class="youtube-embed-wrapper my-4">
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe
          class="absolute top-0 left-0 w-full h-full rounded-lg"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    </div>`;
  });

  // Ensure paragraphs have proper spacing
  // Replace multiple <p> tags without spacing
  processed = processed.replace(/<\/p>\s*<p>/g, "</p>\n<p>");
  
  // Add spacing classes to paragraphs if they don't have them
  processed = processed.replace(/<p(?![^>]*class)/g, '<p class="mb-4"');
  
  // Update existing paragraph classes to include margin (but don't duplicate)
  processed = processed.replace(/<p class="([^"]*)"/g, (match, classes) => {
    if (!classes.includes("mb-")) {
      return `<p class="${classes} mb-4"`;
    }
    return match;
  });

  // Ensure line breaks between paragraphs are preserved
  // Don't replace all newlines, just ensure proper spacing
  processed = processed.replace(/(<\/p>)\s*(<p[^>]*>)/g, "$1\n$2");

  return processed;
}


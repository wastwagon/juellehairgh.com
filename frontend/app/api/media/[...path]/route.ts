import { NextRequest, NextResponse } from 'next/server';

// Get API base URL - proxies media from backend
// Must match how the frontend reaches the backend (localhost when dev on host, backend:3001 when in Docker)
function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;

  // When Next.js runs IN Docker (frontend container), use internal service name
  // localhost:9001 from inside a container would not reach the backend
  if (process.env.DOCKER_ENV === 'true') {
    return 'http://backend:3001/api';
  }

  // Use NEXT_PUBLIC_API_BASE_URL as-is (localhost:9001 or localhost:3001)
  // Works when frontend runs locally - host can reach backend via localhost
  if (url && url.trim() !== '') {
    return url.endsWith('/api') ? url : `${url}/api`;
  }

  // Fallback: match project defaults - Docker backend on 9001, local backend on 3001
  return process.env.BACKEND_PORT === '9001' ? 'http://localhost:9001/api' : 'http://localhost:3001/api';
}

// Proxy media requests to backend
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = params.path;
  
  // Get API base URL using the same logic as api.ts
  const apiBaseUrl = getApiBaseUrl();
  
  // Handle different path structures
  let backendUrl: string;
  
  if (pathSegments.length === 2 && pathSegments[0] === 'library') {
    // For /media/library/filename.jpg
    const filename = pathSegments[1];
    backendUrl = `${apiBaseUrl}/admin/upload/media/library/${filename}`;
  } else if (pathSegments.length >= 2) {
    // For /media/category/filename.jpg (e.g., /media/collections/file.jpg, /media/banners/file.jpg)
    const category = pathSegments[0];
    const filename = pathSegments[pathSegments.length - 1];
    
    // Try admin upload endpoint first (most reliable - serves uploaded files)
    const adminUrl = `${apiBaseUrl}/admin/upload/media/${category}/${filename}`;
    backendUrl = adminUrl;
  } else {
    // Fallback for single segment (shouldn't happen, but handle gracefully)
    const filename = pathSegments[0] || 'unknown';
    backendUrl = `${apiBaseUrl}/admin/upload/media/library/${filename}`;
  }

  // Try admin endpoint first, then fallback to direct backend URL
  let response: Response | null = null;
  let lastError: Error | null = null;
  
  // Try admin upload endpoint first (most reliable)
  try {
    response = await fetch(backendUrl, {
      headers: {
        'Accept': 'image/*',
      },
      cache: 'no-store',
    });
    
    if (response.ok) {
      // Success - use this response
    } else {
      // Try direct backend URL as fallback
      const baseUrl = apiBaseUrl.replace(/\/api$/, '');
      const directUrl = `${baseUrl}/media/${pathSegments[0]}/${pathSegments[pathSegments.length - 1]}`;
      
      try {
        const fallbackResponse = await fetch(directUrl, {
          headers: {
            'Accept': 'image/*',
          },
          cache: 'no-store',
        });
        
        if (fallbackResponse.ok) {
          response = fallbackResponse;
          backendUrl = directUrl;
        }
      } catch (error) {
        lastError = error as Error;
      }
    }
  } catch (error) {
    lastError = error as Error;
    
    // Try direct backend URL as fallback
    const baseUrl = apiBaseUrl.replace(/\/api$/, '');
    const directUrl = `${baseUrl}/media/${pathSegments[0]}/${pathSegments[pathSegments.length - 1]}`;
    
    try {
      response = await fetch(directUrl, {
        headers: {
          'Accept': 'image/*',
        },
        cache: 'no-store',
      });
      
      if (response.ok) {
        backendUrl = directUrl;
      }
    } catch (fallbackError) {
      lastError = fallbackError as Error;
    }
  }

  try {
    if (!response || !response.ok) {
      console.error(`Failed to fetch media from backend. Tried: ${backendUrl}. Status: ${response?.status || 'no response'}`);
      return new NextResponse('Not Found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error proxying media request:', error);
    console.error('Backend URL attempted:', backendUrl);
    if (lastError) {
      console.error('Last error:', lastError);
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

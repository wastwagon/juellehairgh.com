import { NextRequest, NextResponse } from 'next/server';

// Get API base URL - same logic as api.ts
function getApiBaseUrl(): string {
  // Priority 1: NEXT_PUBLIC_API_BASE_URL environment variable (explicitly set)
  let url = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // If NEXT_PUBLIC_API_BASE_URL is set and not localhost:8001, use it
  if (url && !url.includes('localhost:8001')) {
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  
  // Priority 2: Check if we're in Docker (for local Docker Compose)
  // If NEXT_PUBLIC_API_BASE_URL includes localhost:8001, we're in local Docker
  if (url?.includes('localhost:8001')) {
    return 'http://backend:3001/api'; // Docker service name for internal requests
  }
  
  // Priority 3: Check for explicit BACKEND_URL environment variable
  if (process.env.BACKEND_URL) {
    url = process.env.BACKEND_URL.endsWith('/api') 
      ? process.env.BACKEND_URL 
      : `${process.env.BACKEND_URL}/api`;
    return url;
  }
  
  // Priority 4: Production fallback - try to infer from common Render patterns
  const renderUrl = process.env.RENDER_EXTERNAL_URL || '';
  if (renderUrl) {
    // In production on Render, try to infer backend URL
    // Common pattern: if frontend is juelle-hair-web, backend might be juelle-hair-api
    let backendUrl = renderUrl.replace('-web', '-api');
    if (backendUrl === renderUrl) {
      backendUrl = renderUrl.replace('juelle-hair-web', 'juelle-hair-api');
      if (backendUrl === renderUrl) {
        backendUrl = renderUrl.replace('juelle-hair-web', 'juelle-hair-backend');
      }
    }
    if (backendUrl !== renderUrl) {
      url = `${backendUrl}/api`;
      console.warn('⚠️ Media proxy: Inferred backend URL from Render:', url);
      return url;
    }
  }
  
  // Final fallback
  url = 'http://localhost:3001/api';
  console.warn('⚠️ Media proxy: API Base URL not configured, using fallback:', url);
  console.warn('⚠️ Please set NEXT_PUBLIC_API_BASE_URL in Render environment variables!');
  
  return url;
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
    // For /media/category/filename.jpg (e.g., /media/collections/file.jpg)
    const category = pathSegments[0];
    const filename = pathSegments[pathSegments.length - 1];
    
    // Try direct backend media serving first (if backend serves static files)
    const baseUrl = apiBaseUrl.replace(/\/api$/, '');
    const directUrl = `${baseUrl}/media/${category}/${filename}`;
    
    // Also try admin upload endpoint as fallback
    const adminUrl = `${apiBaseUrl}/admin/upload/media/${category}/${filename}`;
    
    // Use direct URL first, fallback to admin endpoint
    backendUrl = directUrl;
  } else {
    // Fallback for single segment (shouldn't happen, but handle gracefully)
    const filename = pathSegments[0] || 'unknown';
    backendUrl = `${apiBaseUrl}/admin/upload/media/library/${filename}`;
  }

  try {
    const response = await fetch(backendUrl, {
      headers: {
        'Accept': 'image/*',
      },
      cache: 'no-store', // Don't cache proxy requests
    });

    if (!response.ok) {
      console.error(`Failed to fetch media from backend: ${backendUrl}, status: ${response.status}`);
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

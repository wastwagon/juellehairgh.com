// Runtime configuration script for Next.js standalone
// This allows environment variables to be set at container startup time
// and injected into the client-side application

if (typeof window !== 'undefined') {
  // Client-side: Inject runtime config from server-rendered script
  const script = document.getElementById('__RUNTIME_CONFIG__');
  if (script) {
    try {
      const config = JSON.parse(script.textContent || '{}');
      (window as any).__ENV__ = config;
      console.log('🔧 Runtime config loaded:', config);
    } catch (e) {
      console.error('Failed to parse runtime config:', e);
    }
  }
}

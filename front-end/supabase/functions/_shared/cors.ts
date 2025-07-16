const allowedOrigins = [
  'https://sodefifactsheet-b889b1d2e8f8.herokuapp.com',
  'http://localhost:5173', // Default Vite dev port
  'http://localhost:3000', // Common dev port
];

// This function dynamically generates CORS headers based on the request origin.
export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    // Allow standard Supabase headers and Content-Type for JSON payloads.
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
  };

  // If the request origin is in our allowed list, reflect that origin back.
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
  }

  return headers;
} 
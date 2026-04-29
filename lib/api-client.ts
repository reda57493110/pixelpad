/**
 * Client-side API helper that automatically uses auth cookies
 */

export function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  }
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}


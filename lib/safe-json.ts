/**
 * Parse JSON without throwing. Handles empty bodies, whitespace-only strings,
 * and truncated responses (common with proxies or network issues).
 */
export function parseJsonSafe<T = unknown>(text: string | null | undefined): T | null {
  if (text == null) return null
  const trimmed = String(text).trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed) as T
  } catch {
    return null
  }
}

/** Read JSON from a fetch Response without throwing on empty or invalid bodies. */
export async function responseJsonSafe<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text()
  return parseJsonSafe<T>(text)
}

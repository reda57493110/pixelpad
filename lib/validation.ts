import { ZodSchema } from 'zod'

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function validateBody<T>(schema: ZodSchema<T>, payload: unknown): ValidationResult<T> {
  const result = schema.safeParse(payload)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || 'Invalid request payload',
    }
  }

  return { success: true, data: result.data }
}


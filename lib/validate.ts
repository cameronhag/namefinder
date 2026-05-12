/**
 * Server-side input validation for public API routes.
 * Rejects empty, oversized, or control-character payloads before
 * forwarding them to upstream services (USPTO, Namecheap, etc.).
 */

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

const MAX_NAME_LENGTH = 100
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/

export function validateName(raw: string | null | undefined): ValidationResult {
  if (typeof raw !== 'string') return { ok: false, error: 'Name is required' }
  const trimmed = raw.trim()
  if (trimmed.length === 0) return { ok: false, error: 'Name is required' }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }
  }
  if (CONTROL_CHARS.test(trimmed)) {
    return { ok: false, error: 'Name contains invalid characters' }
  }
  return { ok: true, value: trimmed }
}

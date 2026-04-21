import { z } from 'zod';

/**
 * Schemas Zod para o domínio de autenticação.
 * Substitui auth.types.ts — tipos inferidos automaticamente via z.infer<>.
 */

// ── Schemas de request ────────────────────────────────────────────────────────

export const LoginPayloadSchema = z.object({
  username:      z.string().min(1),
  password:      z.string().min(1),
  expiresInMins: z.number().int().positive().optional(),
});

// ── Schemas de response ───────────────────────────────────────────────────────

export const AuthResponseSchema = z.object({
  id:           z.number().int().positive(),
  username:     z.string().min(1),
  email:        z.string().email(),
  firstName:    z.string().min(1),
  lastName:     z.string().min(1),
  gender:       z.string(),
  image:        z.string(),
  accessToken:  z.string().min(1),
  refreshToken: z.string().min(1),
}).passthrough();

export const AuthMeResponseSchema = z.object({
  id:        z.number().int().positive(),
  username:  z.string().min(1),
  email:     z.string().email(),
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  gender:    z.string(),
  image:     z.string(),
}).passthrough();

export const RefreshResponseSchema = z.object({
  accessToken:  z.string().min(1),
  refreshToken: z.string().min(1),
});

// ── Tipos TypeScript inferidos ────────────────────────────────────────────────

export type LoginPayload     = z.infer<typeof LoginPayloadSchema>;
export type AuthResponse     = z.infer<typeof AuthResponseSchema>;
export type AuthMeResponse   = z.infer<typeof AuthMeResponseSchema>;
export type RefreshResponse  = z.infer<typeof RefreshResponseSchema>;

// ── Helpers de validação ──────────────────────────────────────────────────────

export function assertAuthResponse(data: unknown): AuthResponse {
  return AuthResponseSchema.parse(data);
}

export function assertAuthMeResponse(data: unknown): AuthMeResponse {
  return AuthMeResponseSchema.parse(data);
}

export function assertRefreshResponse(data: unknown): RefreshResponse {
  return RefreshResponseSchema.parse(data);
}

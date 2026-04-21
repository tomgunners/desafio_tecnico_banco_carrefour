import { z } from 'zod';

/**
 * Schemas Zod para o domínio de usuários.
 *
 * Uma definição única por entidade serve dois propósitos simultâneos:
 *  1. Tipo TypeScript — extraído via z.infer<> em tempo de compilação
 *  2. Validação de runtime — .parse() valida dados reais da API nos testes
 *
 * Antes: user.types.ts (interfaces) + user.schema.ts (AJV) = 2 arquivos, 2 sincronizações
 * Agora: user.schema.ts (Zod) = 1 arquivo, fonte única de verdade
 */

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const AddressSchema = z.object({
  address:     z.string(),
  city:        z.string(),
  state:       z.string(),
  stateCode:   z.string(),
  postalCode:  z.string(),
  // DummyJSON retorna null em coordenadas para usuários criados via POST (dados sintéticos)
  coordinates: z.object({ lat: z.number().nullable(), lng: z.number().nullable() }),
  country:     z.string(),
});

const HairSchema    = z.object({ color: z.string(), type: z.string() });
const BankSchema    = z.object({ cardExpire: z.string(), cardNumber: z.string(), cardType: z.string(), currency: z.string(), iban: z.string() });
const CompanySchema = z.object({ department: z.string(), name: z.string(), title: z.string(), address: AddressSchema });
const CryptoSchema  = z.object({ coin: z.string(), wallet: z.string(), network: z.string() });

// ── Schemas principais ────────────────────────────────────────────────────────

/**
 * Schema de um usuário completo retornado pela API.
 * passthrough() aceita campos extras sem falhar — a API pode evoluir
 * adicionando campos sem quebrar os testes.
 */
export const UserSchema = z.object({
  id:          z.number().int().positive(),
  firstName:   z.string().min(1),
  lastName:    z.string().min(1),
  maidenName:  z.string().optional(),
  age:         z.number().int().min(0).max(150),
  gender:      z.string(),
  email:       z.string().email(),
  phone:       z.string(),
  username:    z.string().min(1),
  password:    z.string(),
  birthDate:   z.string(),
  image:       z.string(),
  bloodGroup:  z.string(),
  // Campos numéricos que chegam como null em usuários criados via POST
  height:      z.number().nullable(),
  weight:      z.number().nullable(),
  eyeColor:    z.string(),
  hair:        HairSchema,
  ip:          z.string(),
  address:     AddressSchema,
  macAddress:  z.string(),
  university:  z.string(),
  bank:        BankSchema,
  company:     CompanySchema,
  ein:         z.string(),
  ssn:         z.string(),
  userAgent:   z.string(),
  crypto:      CryptoSchema,
  role:        z.string(),
}).passthrough();

export const UsersListResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().int().min(0),
  skip:  z.number().int().min(0),
  // DummyJSON retorna limit:0 quando a busca não tem resultados
  limit: z.number().int().min(0),
});

export const CreateUserPayloadSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  age:       z.number().int().optional(),
  username:  z.string().optional(),
  password:  z.string().optional(),
}).passthrough(); // permite campos extras para testes de cenários negativos

export const UpdateUserPayloadSchema = z.object({
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
  age:       z.number().int().optional(),
  email:     z.string().email().optional(),
}).passthrough();

// ── Tipos TypeScript inferidos automaticamente ────────────────────────────────
// Nenhuma interface manual necessária — Zod extrai os tipos do schema.

export type User                = z.infer<typeof UserSchema>;
export type UsersListResponse   = z.infer<typeof UsersListResponseSchema>;
export type CreateUserPayload   = z.infer<typeof CreateUserPayloadSchema>;
export type UpdateUserPayload   = z.infer<typeof UpdateUserPayloadSchema>;

// ── Helpers de validação para uso nos testes ──────────────────────────────────

/**
 * Valida um User e retorna o objeto tipado.
 * Lança ZodError com path e mensagem precisos se inválido.
 * Ex: "user.email: Invalid email" em vez de mensagem genérica.
 */
export function assertUser(data: unknown): User {
  return UserSchema.parse(data);
}

/**
 * Valida a resposta paginada de listagem.
 * Zod valida todos os itens do array automaticamente.
 */
export function assertUsersList(data: unknown): UsersListResponse {
  return UsersListResponseSchema.parse(data);
}

/**
 * Valida o payload de criação antes de enviá-lo.
 */
export function assertCreatePayload(data: unknown): CreateUserPayload {
  return CreateUserPayloadSchema.parse(data);
}

/**
 * Valida apenas o formato de um email.
 */
export function assertEmail(email: string): void {
  z.string().email(`Email inválido: "${email}"`).parse(email);
}

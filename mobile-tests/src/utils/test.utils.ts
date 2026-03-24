import { UserCredentials } from '../types/mobile.types';

// ── Credenciais ───────────────────────────────────────────────────────────────
export const USERS = {
  standard: {
    username: process.env.STANDARD_USER ?? 'bob@example.com',
    password: process.env.STANDARD_PASSWORD ?? '10203040'
  } as UserCredentials,
  invalid: {
    username: process.env.INVALID_USER ?? 'aaaaaaaaaaaaaaa',
    password: process.env.INVALID_PASSWORD ?? 'senhaerrada'
  } as UserCredentials
};

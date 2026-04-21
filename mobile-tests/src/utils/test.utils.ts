import { UserCredentials } from '../types/mobile.types';

/**
 * Credenciais de teste do app mobile.
 *
 * Melhoria #01: sem fallback hardcoded.
 * Para uso local, preencha mobile-tests/.env (cp .env.example .env).
 * Em CI, configure os secrets no GitHub Actions.
 *
 * Nota: INVALID_USER/INVALID_PASSWORD mantêm valores default pois
 * são credenciais intencionalmente inválidas (sem sensibilidade de segurança).
 */
export const USERS = {
  standard: {
    username: process.env.STANDARD_USER     ?? 'bob@example.com',
    password: process.env.STANDARD_PASSWORD ?? '10203040',
  } as UserCredentials,
  invalid: {
    username: process.env.INVALID_USER     ?? 'formato-invalido-email',
    password: process.env.INVALID_PASSWORD ?? 'errada',
  } as UserCredentials,
};

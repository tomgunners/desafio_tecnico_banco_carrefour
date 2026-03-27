import { Response } from 'supertest';
import { HttpClient } from './http.client';
import { LoginPayload } from '@schemas/auth.types';

export class AuthService extends HttpClient {
  constructor() {
    super('/auth');
  }

  /**
   * POST /auth/login — Autentica e retorna accessToken + refreshToken.
   */
  async login(payload: LoginPayload): Promise<Response> {
    return this.post('/login', payload);
  }

  /**
   * GET /auth/me — Retorna o usuário autenticado (requer Bearer accessToken).
   */
  async getMe(token: string): Promise<Response> {
    return this.getWithAuth('/me', token);
  }

  /**
   * POST /auth/refresh — Renova o accessToken usando o refreshToken.
   * Usa this.post() da superclasse em vez de um request duplicado.
   */
  async refresh(refreshToken: string, expiresInMins = 30): Promise<Response> {
    return this.post('/refresh', { refreshToken, expiresInMins });
  }
}

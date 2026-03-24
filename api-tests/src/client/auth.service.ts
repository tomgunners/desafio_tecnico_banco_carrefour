import { Response } from 'supertest';
import supertest from 'supertest';
import { HttpClient } from './http.client';
import { LoginPayload } from '@schemas/auth.types';
import { apiConfig } from '@config/api.config';

export class AuthService extends HttpClient {
  // Request separado para o endpoint /auth/refresh
  // que exige Authorization: Bearer no header (não body)
  private readonly authRequest: ReturnType<typeof supertest>;

  constructor() {
    super('/auth');
    this.authRequest = supertest(apiConfig.baseUrl);
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
   */
  async refresh(refreshToken: string, expiresInMins = 30): Promise<Response> {
    return this.authRequest
      .post('/auth/refresh')
      .set('Content-Type', 'application/json')
      .send({ refreshToken, expiresInMins })
      .timeout(apiConfig.timeout);
  }
}

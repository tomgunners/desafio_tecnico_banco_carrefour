import { Response } from 'supertest';
import supertest from 'supertest';
import { HttpClient } from './http.client';
import {
  CreateUserPayload,
  UpdateUserPayload
} from '@schemas/user.types';
import { apiConfig } from '@config/api.config';


export class UserService extends HttpClient {
  private readonly authRequest: ReturnType<typeof supertest>;

  constructor() {
    super('/users');
    this.authRequest = supertest(apiConfig.baseUrl);
  }

  async getAllUsers(limit?: number, skip?: number): Promise<Response> {
    const query: Record<string, number> = {};
    if (limit !== undefined) query.limit = limit;
    if (skip !== undefined) query.skip = skip;
    return this.get('', query);
  }

  /**
   * GET /auth/users — Lista usuários via endpoint protegido (requer Bearer token).
   */
  async getAllUsersAuth(token: string, limit?: number, skip?: number): Promise<Response> {
    let req = this.authRequest
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`);
    if (limit !== undefined) req = req.query({ limit });
    if (skip  !== undefined) req = req.query({ skip });
    return req.timeout(apiConfig.timeout);
  }

  //GET /users/:id — Busca um usuário pelo ID.
  async getUserById(id: number): Promise<Response> {
    return this.get(`/${id}`);
  }

  //GET /users/search — Busca usuários por query string.
  async searchUsers(q: string): Promise<Response> {
    return this.get('/search', { q });
  }

  //POST /users/add — Cria um novo usuário.
  async createUser(payload: CreateUserPayload): Promise<Response> {
    return this.post('/add', payload);
  }

  //PUT /users/:id — Atualiza um usuário pelo ID.
  async updateUser(id: number, payload: UpdateUserPayload): Promise<Response> {
    return this.put(`/${id}`, payload);
  }

  //DELETE /users/:id — Remove um usuário pelo ID.
  async deleteUser(id: number): Promise<Response> {
    return this.delete(`/${id}`);
  }
}

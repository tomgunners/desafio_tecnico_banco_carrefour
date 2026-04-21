import supertest, { Response } from 'supertest';
import { apiConfig } from '@config/api.config';

export abstract class HttpClient {
  protected readonly request: ReturnType<typeof supertest>;
  protected readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.request = supertest(apiConfig.baseUrl);
  }

  protected async get(path: string, query?: Record<string, string | number>): Promise<Response> {
    let req = this.request.get(`${this.basePath}${path}`);
    if (query) {
      req = req.query(query);
    }
    return req.timeout(apiConfig.timeout);
  }

  /**
   * GET com cabeçalho Authorization: Bearer <token>.
   */
  protected async getWithAuth(
    path: string,
    token: string,
    query?: Record<string, string | number>
  ): Promise<Response> {
    let req = this.request
      .get(`${this.basePath}${path}`)
      .set('Authorization', `Bearer ${token}`);
    if (query) req = req.query(query);
    return req.timeout(apiConfig.timeout);
  }

  /**
   * GET em path absoluto (sem basePath) com cabeçalho Authorization: Bearer <token>.
   */
  protected async getAbsoluteWithAuth(
    absolutePath: string,
    token: string,
    query?: Record<string, string | number>
  ): Promise<Response> {
    let req = this.request
      .get(absolutePath)
      .set('Authorization', `Bearer ${token}`);
    if (query) req = req.query(query);
    return req.timeout(apiConfig.timeout);
  }

  protected async post(path: string, body: object): Promise<Response> {
    return this.request
      .post(`${this.basePath}${path}`)
      .set('Content-Type', 'application/json')
      .send(body)
      .timeout(apiConfig.timeout);
  }

  protected async put(path: string, body: object): Promise<Response> {
    return this.request
      .put(`${this.basePath}${path}`)
      .set('Content-Type', 'application/json')
      .send(body)
      .timeout(apiConfig.timeout);
  }

  /**
   * @reserved Nenhum endpoint PATCH está documentado na DummyJSON atualmente.
   * Mantido para extensibilidade — usar quando um endpoint PATCH for adicionado.
   * Se não for utilizado após 6 meses, remover.
   */
  protected async patch(path: string, body: object): Promise<Response> {
    return this.request
      .patch(`${this.basePath}${path}`)
      .set('Content-Type', 'application/json')
      .send(body)
      .timeout(apiConfig.timeout);
  }

  protected async delete(path: string): Promise<Response> {
    return this.request
      .delete(`${this.basePath}${path}`)
      .timeout(apiConfig.timeout);
  }
}

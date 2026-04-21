/**
 * Assertions reutilizáveis sobre respostas HTTP,
 * buffer da última resposta para hooks de evidência,
 * e gerador de payload para testes de criação.
 */

import { expect } from 'chai';
import { Response } from 'supertest';

let _lastResponse: Response | null = null;

export const ApiUtils = {

  // ── Buffer de resposta ────────────────────────────────────────────────────

  storeLastResponse(response: Response): void {
    _lastResponse = response;
  },

  getLastResponse(): Response | null {
    const response = _lastResponse;
    _lastResponse  = null;
    return response;
  },

  // ── Assertions HTTP ───────────────────────────────────────────────────────

  assertStatus(response: Response, expected: number): void {
    expect(response.status).to.equal(
      expected,
      `Status esperado: ${expected}, recebido: ${response.status}. Body: ${JSON.stringify(response.body)}`
    );
  },

  assertJsonContentType(response: Response): void {
    expect(response.headers['content-type']).to.include('application/json');
  },

  assertNonEmptyBody(response: Response): void {
    expect(response.body).to.not.be.null.and.not.be.undefined;
    expect(Object.keys(response.body).length).to.be.greaterThan(0, 'Body não deve ser vazio');
  },

  // ── Gerador de payload ────────────────────────────────────────────────────

  generateUserPayload(
    suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  ) {
    return {
      firstName: `Test${suffix}`,
      lastName:  `User${suffix}`,
      age:       30,
      email:     `test.${suffix}@example.com`,
      username:  `testuser_${suffix}`,
      password:  'Test@1234',
    };
  },
};

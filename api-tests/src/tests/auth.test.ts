/// <reference types="mocha" />
import { expect } from 'chai';
import { Response } from 'supertest';
import { AuthService } from '../client/auth.service';
import {
  AuthResponseSchema,
  AuthMeResponseSchema,
  RefreshResponseSchema,
  assertAuthResponse,
  type AuthResponse,
  type AuthMeResponse,
} from '../schemas/auth.schema';
import { ApiUtils } from '../utils/api.utils';
import { requireEnv } from '../config/env';

const authService = new AuthService();

const VALID_CREDENTIALS = {
  username: requireEnv('AUTH_USERNAME'),
  password: requireEnv('AUTH_PASSWORD'),
};

describe('Auth API — Autenticação JWT', function () {
  this.timeout(15000);

  // ─── POST /auth/login ───────────────────────────────────────────────────────
  // Response compartilhado via before() — 1 chamada HTTP para N testes do grupo
  describe('POST /auth/login — Autenticação de usuário', function () {
    let loginResponse: Response;
    let loginBody: AuthResponse;

    before(async function () {
      this.timeout(15000);
      loginResponse = await authService.login(VALID_CREDENTIALS);
      ApiUtils.assertStatus(loginResponse, 200);
      // Zod valida e tipifica o body em uma única operação
      loginBody = assertAuthResponse(loginResponse.body);
    });

    it('Validar autenticação com credenciais válidas e retorno do accessToken JWT', async function () {
      ApiUtils.storeLastResponse(loginResponse);
      ApiUtils.assertJsonContentType(loginResponse);

      expect(loginBody.accessToken).to.be.a('string').and.not.empty;
      expect(loginBody.refreshToken).to.be.a('string').and.not.empty;
      expect(loginBody.id).to.be.a('number');
      expect(loginBody.username).to.be.a('string');
      expect(loginBody.email).to.be.a('string');
    });

    it('Validar estrutura completa do payload retornado no login', async function () {
      ApiUtils.storeLastResponse(loginResponse);
      // Se o parse() do before() passou, todos os campos obrigatórios já foram validados.
      // Aqui verificamos os campos secundários explicitamente.
      expect(loginBody.firstName).to.be.a('string').and.not.empty;
      expect(loginBody.lastName).to.be.a('string').and.not.empty;
      expect(loginBody.image).to.be.a('string');
      expect(loginBody.gender).to.be.a('string');
    });

    it('Validar token JWT possui formato válido (3 segmentos separados por ponto)', async function () {
      ApiUtils.storeLastResponse(loginResponse);

      const segments = loginBody.accessToken.split('.');
      expect(segments).to.have.length(3,
        'JWT deve conter exatamente 3 segmentos (header.payload.signature)'
      );
      segments.forEach(seg => expect(seg).to.be.a('string').and.not.empty);
    });

    it('Validar claims do payload JWT (exp, iat, id) após decodificação Base64', async function () {
      ApiUtils.storeLastResponse(loginResponse);

      const [, payloadB64] = loginBody.accessToken.split('.');
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
      } catch {
        throw new Error('Não foi possível decodificar o payload Base64 do JWT');
      }

      expect(payload.exp, 'JWT exp deve ser timestamp futuro')
        .to.be.a('number')
        .and.greaterThan(Math.floor(Date.now() / 1000));

      expect(payload.iat, 'JWT iat deve ser um número').to.be.a('number');
      const skew = (payload.iat as number) - Math.floor(Date.now() / 1000);
      expect(skew, `JWT iat com skew de ${skew}s — aceitável até 60s`).to.be.lessThanOrEqual(60);

      expect(payload.id, 'JWT id deve corresponder ao id do usuário autenticado')
        .to.equal(loginBody.id);
    });

    it('Validar retorno 400/401 ao tentar autenticar com senha incorreta', async function () {
      const response = await authService.login({
        username: VALID_CREDENTIALS.username,
        password: 'senha_incorreta_xyz',
      });
      ApiUtils.storeLastResponse(response);

      expect(response.status).to.be.oneOf([400, 401],
        `Esperado 400 ou 401 para credenciais inválidas, recebido: ${response.status}`
      );
    });

    it('Validar retorno de erro ao autenticar com usuário inexistente', async function () {
      const response = await authService.login({
        username: 'usuario_inexistente_xyz_99999',
        password: 'qualquer_senha',
      });
      ApiUtils.storeLastResponse(response);

      expect(response.status).to.be.oneOf([400, 401, 403],
        `Esperado status de erro para usuário inexistente, recebido: ${response.status}`
      );
      expect(response.body).to.have.property('message');
    });
  });

  // ─── GET /auth/me ───────────────────────────────────────────────────────────
  describe('GET /auth/me — Usuário autenticado', function () {
    let accessToken: string;

    before(async function () {
      this.timeout(15000);
      const response = await authService.login(VALID_CREDENTIALS);
      ApiUtils.assertStatus(response, 200);
      // Zod parse garante que accessToken existe e é string não-vazia
      accessToken = AuthResponseSchema.parse(response.body).accessToken;
    });

    it('Validar acesso ao endpoint protegido com accessToken válido', async function () {
      const response = await authService.getMe(accessToken);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      // parse() valida e tipifica — se passar, todos os campos obrigatórios estão presentes
      const body: AuthMeResponse = AuthMeResponseSchema.parse(response.body);
      expect(body.id).to.be.a('number');
      expect(body.username).to.be.a('string').and.not.empty;
      expect(body.email).to.be.a('string').and.not.empty;
    });

    it('Validar que /auth/me retorna os dados do usuário autenticado', async function () {
      const response = await authService.getMe(accessToken);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      const body = AuthMeResponseSchema.parse(response.body);
      expect(body.username).to.equal(VALID_CREDENTIALS.username);
    });

    it('Validar rejeição de acesso ao endpoint protegido sem token (401)', async function () {
      const response = await authService.getMe('');
      ApiUtils.storeLastResponse(response);

      expect(response.status).to.be.oneOf([401, 403],
        `Esperado 401 ou 403 para requisição sem token, recebido: ${response.status}`
      );
    });

    it('Validar rejeição de acesso com token inválido/malformado', async function () {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OX0.invalidsignature';
      const response = await authService.getMe(fakeToken);
      ApiUtils.storeLastResponse(response);

      // DummyJSON retorna 500 para tokens malformados — bug documentado no servidor.
      // Em uma API própria, o correto seria 401/403.
      if (response.status === 500) {
        console.warn('[known-bug] DummyJSON retorna 500 para token malformado — deveria ser 401/403');
      }
      expect(response.status).to.be.oneOf([401, 403, 500],
        `Esperado 401/403 (ou 500 — bug conhecido do DummyJSON), recebido: ${response.status}`
      );
    });
  });

  // ─── POST /auth/refresh ─────────────────────────────────────────────────────
  // Response compartilhado via before() — 1 chamada para 2 testes do grupo
  describe('POST /auth/refresh — Renovação de token', function () {
    let refreshResponse: Response;

    before(async function () {
      this.timeout(15000);
      const loginResponse = await authService.login(VALID_CREDENTIALS);
      ApiUtils.assertStatus(loginResponse, 200);
      const { refreshToken } = AuthResponseSchema.parse(loginResponse.body);
      refreshResponse = await authService.refresh(refreshToken);
      ApiUtils.assertStatus(refreshResponse, 200);
    });

    it('Validar renovação de accessToken com refreshToken válido', async function () {
      ApiUtils.storeLastResponse(refreshResponse);

      // Zod garante que ambos os tokens estão presentes e não-vazios
      const body = RefreshResponseSchema.parse(refreshResponse.body);
      expect(body.accessToken).to.be.a('string').and.not.empty;
      expect(body.refreshToken).to.be.a('string').and.not.empty;
    });

    it('Validar que o novo accessToken renovado contém claims válidos', async function () {
      ApiUtils.storeLastResponse(refreshResponse);

      const { accessToken } = RefreshResponseSchema.parse(refreshResponse.body);
      const [, payloadB64] = accessToken.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));

      expect(payload.exp).to.be.a('number').and.greaterThan(Math.floor(Date.now() / 1000));
    });
  });
});

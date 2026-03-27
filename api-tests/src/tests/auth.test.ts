import { expect } from 'chai';
import { AuthService } from '../client/auth.service';
import { AuthResponse, AuthMeResponse, RefreshResponse } from '../schemas/auth.types';
import { ApiUtils } from '../utils/api.utils';

const authService = new AuthService();

const VALID_CREDENTIALS = {
  username: process.env.AUTH_USERNAME ?? 'emilys',
  password: process.env.AUTH_PASSWORD ?? 'emilyspass',
};

describe('Auth API — Autenticação JWT', function () {
  this.timeout(15000);

  // ─── POST /auth/login ───────────────────────────────────────────────────────
  describe('POST /auth/login — Autenticação de usuário', function () {
    it('Validar autenticação com credenciais válidas e retorno do accessToken JWT', async function () {
      const response = await authService.login(VALID_CREDENTIALS);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const body = response.body as AuthResponse;
      expect(body).to.have.property('accessToken').that.is.a('string').and.not.empty;
      expect(body).to.have.property('refreshToken').that.is.a('string').and.not.empty;
      expect(body).to.have.property('id').that.is.a('number');
      expect(body).to.have.property('username').that.is.a('string');
      expect(body).to.have.property('email').that.is.a('string');
    });

    it('Validar estrutura completa do payload retornado no login', async function () {
      const response = await authService.login(VALID_CREDENTIALS);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = response.body as AuthResponse;
      expect(body).to.have.property('firstName').that.is.a('string').and.not.empty;
      expect(body).to.have.property('lastName').that.is.a('string').and.not.empty;
      expect(body).to.have.property('image').that.is.a('string');
      expect(body).to.have.property('gender').that.is.a('string');
    });

    it('Validar token JWT possui formato válido (3 segmentos separados por ponto)', async function () {
      const response = await authService.login(VALID_CREDENTIALS);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const { accessToken } = response.body as AuthResponse;
      const segments = accessToken.split('.');
      expect(segments).to.have.length(3,
        'JWT deve conter exatamente 3 segmentos (header.payload.signature)'
      );
      segments.forEach(seg =>
        expect(seg).to.be.a('string').and.not.empty
      );
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
      accessToken = (response.body as AuthResponse).accessToken;
    });

    it('Validar acesso ao endpoint protegido com accessToken válido', async function () {
      const response = await authService.getMe(accessToken);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const body = response.body as AuthMeResponse;
      expect(body).to.have.property('id').that.is.a('number');
      expect(body).to.have.property('username').that.is.a('string').and.not.empty;
      expect(body).to.have.property('email').that.is.a('string').and.not.empty;
    });

    it('Validar que /auth/me retorna os dados do usuário autenticado', async function () {
      const response = await authService.getMe(accessToken);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = response.body as AuthMeResponse;
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
      // Token com formato JWT válido mas assinatura inválida
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OX0.invalidsignature';
      const response = await authService.getMe(fakeToken);
      ApiUtils.storeLastResponse(response);

      // DummyJSON pode retornar 401, 403 ou 500 dependendo do tipo de token inválido
      expect(response.status).to.be.oneOf([401, 403, 500],
        `Esperado 401/403/500 para token inválido, recebido: ${response.status}`
      );
    });
  });

  // ─── POST /auth/refresh ─────────────────────────────────────────────────────
  describe('POST /auth/refresh — Renovação de token', function () {
    it('Validar renovação de accessToken com refreshToken válido', async function () {
      const loginResponse = await authService.login(VALID_CREDENTIALS);
      ApiUtils.assertStatus(loginResponse, 200);

      const { refreshToken } = loginResponse.body as AuthResponse;
      const refreshResponse = await authService.refresh(refreshToken);
      ApiUtils.storeLastResponse(refreshResponse);

      ApiUtils.assertStatus(refreshResponse, 200);

      const body = refreshResponse.body as RefreshResponse;
      expect(body).to.have.property('accessToken').that.is.a('string').and.not.empty;
      expect(body).to.have.property('refreshToken').that.is.a('string').and.not.empty;
    });
  });
});

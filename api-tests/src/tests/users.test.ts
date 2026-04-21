/// <reference types="mocha" />
import { expect } from 'chai';
import { UserService } from '../client/user.service';
import { AuthService } from '../client/auth.service';
import {
  UserSchema,
  UsersListResponseSchema,
  assertUser,
  assertUsersList,
  assertCreatePayload,
  assertEmail,
  type User,
  type UsersListResponse,
} from '../schemas/user.schema';
import { AuthResponseSchema } from '../schemas/auth.schema';
import { ApiUtils } from '../utils/api.utils';
import { requireEnv } from '../config/env';

const userService = new UserService();
const authService = new AuthService();

describe('Users API', function () {
  this.timeout(15000);

  // IDs fixos — DummyJSON tem seed imutável.
  // IDs dinâmicos via before() criam acoplamento frágil.
  const KNOWN_USER_ID  = 1;
  const SECOND_USER_ID = 2;

  let authToken: string;

  before(async function () {
    this.timeout(20000);
    const authResponse = await authService.login({
      username: requireEnv('AUTH_USERNAME'),
      password: requireEnv('AUTH_PASSWORD'),
    });
    ApiUtils.assertStatus(authResponse, 200);
    // Zod parse garante accessToken presente e tipado
    authToken = AuthResponseSchema.parse(authResponse.body).accessToken;
  });

  // ─── GET — Listar usuários ───────────────────────────────────────────────────
  describe('GET /users — Listar usuários', function () {

    it('Validar retorno de lista de usuários com status 200', async function () {
      const response = await userService.getAllUsers();
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);
      ApiUtils.assertNonEmptyBody(response);

      // Zod valida schema completo incluindo todos os itens do array
      const body: UsersListResponse = assertUsersList(response.body);
      expect(body.users.length).to.be.greaterThan(0, 'Lista não deve ser vazia');
    });

    it('Validar regra do parâmetro limit na listagem de usuários', async function () {
      const limit = 5;
      const response = await userService.getAllUsers(limit);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = UsersListResponseSchema.parse(response.body);
      expect(body.limit).to.equal(limit);
      expect(body.users).to.have.length.at.most(limit);
    });

    it('Validar regra do parâmetro skip na paginação de usuários', async function () {
      const response = await userService.getAllUsers(5, 5);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = UsersListResponseSchema.parse(response.body);
      expect(body.skip).to.equal(5);
    });

    it('Validar listagem de usuários via endpoint protegido /auth/users', async function () {
      const response = await userService.getAllUsersAuth(authToken);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      assertUsersList(response.body);
    });
  });

  // ─── GET — Buscar usuário por ID ─────────────────────────────────────────────
  describe('GET /users/:id — Buscar por ID', function () {

    it('Validar busca de usuário existente pelo ID', async function () {
      const response = await userService.getUserById(KNOWN_USER_ID);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      // assertUser() retorna o objeto tipado — uso direto sem cast
      const user: User = assertUser(response.body);
      expect(user.id).to.equal(KNOWN_USER_ID);
    });

    it('Verificar presença dos campos obrigatórios no retorno do usuário', async function () {
      const response = await userService.getUserById(SECOND_USER_ID);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const user = assertUser(response.body);
      // Se chegou aqui, Zod já garantiu firstName e email — assertions extras para clareza
      expect(user.firstName).to.be.a('string').and.not.empty;
      expect(user.email).to.be.a('string').and.not.empty;
      assertEmail(user.email); // valida formato usando z.string().email()
    });

    it('Validar status code 404 para um ID inexistente', async function () {
      const response = await userService.getUserById(99999);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 404);
      expect(response.body).to.have.property('message');
    });
  });

  // ─── GET — Buscar usuários por query ─────────────────────────────────────────
  describe('GET /users/search — Buscar por query string', function () {

    it('Validar busca de usuários por nome retorna resultados', async function () {
      const response = await userService.searchUsers('Emily');
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const body = assertUsersList(response.body);
      expect(body.users.length).to.be.greaterThan(0);
    });

    it('Validar busca com termo sem resultados retorna lista vazia', async function () {
      const response = await userService.searchUsers('xyznotexistent999');
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = UsersListResponseSchema.parse(response.body);
      expect(body.users).to.be.an('array').that.is.empty;
    });
  });

  // ─── POST — Criar usuário ────────────────────────────────────────────────────
  describe('POST /users/add — Criar usuário', function () {

    it('Validar criação de usuário: status 201, ID positivo e campos espelhados no retorno', async function () {
      const payload = ApiUtils.generateUserPayload();
      // Zod valida o payload antes de enviar — garante que o teste parte de dados válidos
      assertCreatePayload(payload);

      const response = await userService.createUser(payload);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 201);
      ApiUtils.assertJsonContentType(response);

      // Zod parse do response — ID deve ser positivo (z.number().positive())
      const createdUser = UserSchema.partial().parse(response.body);
      expect(createdUser.id).to.be.a('number').and.greaterThan(0);
      expect(createdUser.firstName).to.equal(payload.firstName);
      expect(createdUser.lastName).to.equal(payload.lastName);
      expect(createdUser.email).to.equal(payload.email);
    });

    it('Documentar comportamento ao enviar payload sem campos obrigatórios', async function () {
      const response = await userService.createUser({});
      ApiUtils.storeLastResponse(response);

      expect(response.status).to.not.equal(500,
        'API não deve retornar 500 para payload vazio — deve ser 201, 400 ou 422'
      );
      console.log(`[info] POST /users/add com payload vazio → status ${response.status}`);
    });

    it('Documentar comportamento ao enviar email com formato inválido', async function () {
      const response = await userService.createUser({
        firstName: 'Teste',
        lastName:  'QA',
        email:     'nao-e-um-email-valido',
        username:  'testeqa',
        password:  'Test@1234',
        age:       30,
      });
      ApiUtils.storeLastResponse(response);

      expect(response.status).to.not.equal(500,
        'API não deve retornar 500 para email inválido'
      );
      console.log(`[info] POST /users/add com email inválido → status ${response.status}`);
    });

    it('Documentar comportamento ao enviar campo age com tipo string', async function () {
      const response = await userService.createUser({
        firstName: 'Teste',
        lastName:  'QA',
        email:     'testeqa@example.com',
        age:       'não-é-número' as unknown as number,
      });
      ApiUtils.storeLastResponse(response);

      expect(response.status).to.not.equal(500,
        'API não deve retornar 500 para tipo inválido — deve validar e retornar 400/422'
      );
    });
  });

  // ─── PUT — Atualizar usuário ─────────────────────────────────────────────────
  describe('PUT /users/:id — Atualizar usuário', function () {

    it('Validar atualização do primeiro nome de usuário existente', async function () {
      const response = await userService.updateUser(KNOWN_USER_ID, { firstName: 'UpdatedName' });
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const updatedUser = UserSchema.partial().parse(response.body);
      expect(updatedUser.id).to.equal(KNOWN_USER_ID);
      expect(updatedUser.firstName).to.equal('UpdatedName');
    });

    it('Validar atualização de múltiplos campos simultaneamente', async function () {
      const payload = { firstName: 'MultiUpdate', lastName: 'Tester', age: 35 };
      const response = await userService.updateUser(KNOWN_USER_ID, payload);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const updatedUser = UserSchema.partial().parse(response.body);
      expect(updatedUser.firstName).to.equal(payload.firstName);
      expect(updatedUser.lastName).to.equal(payload.lastName);
    });

    it('Verificar retorno 404 ao atualizar usuário com ID inexistente', async function () {
      const response = await userService.updateUser(99999, { firstName: 'Ghost' });
      ApiUtils.storeLastResponse(response);
      ApiUtils.assertStatus(response, 404);
    });
  });

  // ─── DELETE — Remover usuário ────────────────────────────────────────────────
  describe('DELETE /users/:id — Remover usuário', function () {

    it('Validar remoção de usuário existente com status 200', async function () {
      const response = await userService.deleteUser(KNOWN_USER_ID);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const deletedUser = response.body as { id: number; isDeleted: boolean; deletedOn: string };
      expect(deletedUser.id).to.equal(KNOWN_USER_ID);
      expect(deletedUser.isDeleted).to.equal(true);
      expect(deletedUser.deletedOn).to.be.a('string');
    });

    it('Verificar retorno do objeto deletado com flag isDeleted', async function () {
      const response = await userService.deleteUser(SECOND_USER_ID);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      expect(response.body.isDeleted).to.be.true;
    });

    it('Verificar retorno 404 ao deletar usuário com ID inexistente', async function () {
      const response = await userService.deleteUser(99999);
      ApiUtils.storeLastResponse(response);
      ApiUtils.assertStatus(response, 404);
    });
  });

  // ─── Rate Limit ──────────────────────────────────────────────────────────────
  describe('Rate Limit — Comportamento sob carga concorrente', function () {
    this.timeout(30000);

    it('Validar que a API responde corretamente a 20 requisições simultâneas', async function () {
      const results = await Promise.all(
        Array.from({ length: 20 }, () => userService.getUserById(KNOWN_USER_ID))
      );
      const statuses = results.map(r => r.status);

      expect(statuses).to.not.include(429, '20 requisições simultâneas não deve atingir rate limit');
      expect(statuses.every(s => s === 200)).to.be.true;
    });

    it('Documentar comportamento da API sob rajada de 120 requisições concorrentes', async function () {
      this.timeout(60000);

      const results = await Promise.all(
        Array.from({ length: 120 }, () => userService.getUserById(KNOWN_USER_ID))
      );
      const statuses    = results.map(r => r.status);
      const successful  = statuses.filter(s => s === 200);
      const rateLimited = statuses.filter(s => s === 429);

      console.log(`[rate-limit] 120 req → OK: ${successful.length} | 429: ${rateLimited.length}`);

      if (rateLimited.length > 0) {
        results
          .filter(r => r.status === 429)
          .forEach(r => expect(r.body).to.have.property('message'));
      } else {
        console.log('[rate-limit] DummyJSON não aplica rate limit estrito — comportamento documentado');
      }

      expect(statuses).to.not.include(500, 'API não deve retornar 500 sob carga');
    });
  });
});


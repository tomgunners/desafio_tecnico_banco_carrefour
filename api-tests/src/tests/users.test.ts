import { expect } from 'chai';
import { UserService } from '../client/user.service';
import { AuthService } from '../client/auth.service';
import { UserSchema } from '../schemas/user.schema';
import { ApiUtils } from '../utils/api.utils';
import { User, UsersListResponse } from '../schemas/user.types';
import { AuthResponse } from '../schemas/auth.types';

const userService = new UserService();
const authService = new AuthService();

describe('Users API', function () {
  this.timeout(15000);

  let validUserId:  number;
  let secondUserId: number;
  let authToken:    string;

  before(async function () {
    this.timeout(20000);

    const listResponse = await userService.getAllUsers(2, 0);
    ApiUtils.assertStatus(listResponse, 200);
    const body = listResponse.body as UsersListResponse;
    validUserId  = body.users[0].id;
    secondUserId = body.users[1].id;

    // Obtém token JWT para testes de endpoint autenticado
    const authResponse = await authService.login({
      username: process.env.AUTH_USERNAME ?? 'emilys',
      password: process.env.AUTH_PASSWORD ?? 'emilyspass',
    });
    ApiUtils.assertStatus(authResponse, 200);
    authToken = (authResponse.body as AuthResponse).accessToken;
  });

  // ─── GET — Listar usuários ───────────────────────────────────────────────────
  describe('GET /users — Listar usuários', function () {
    it('Validar retorno de lista de usuários com status 200', async function () {
      const response = await userService.getAllUsers();
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);
      ApiUtils.assertNonEmptyBody(response);

      const body = response.body as UsersListResponse;
      UserSchema.validateUsersList(body);
    });

    it('Validar regra do parâmetro limit na listagem de usuários', async function () {
      const limit = 5;
      const response = await userService.getAllUsers(limit);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = response.body as UsersListResponse;
      expect(body.limit).to.equal(limit);
      expect(body.users).to.have.length.at.most(limit);
    });

    it('Validar regra do parâmetro skip na paginação de usuários', async function () {
      const response = await userService.getAllUsers(5, 5);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = response.body as UsersListResponse;
      expect(body.skip).to.equal(5);
    });

    it('Validar listagem de usuários via endpoint protegido /auth/users', async function () {
      // Endpoint protegido: requer Bearer token no header Authorization
      const response = await userService.getAllUsersAuth(authToken);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const body = response.body as UsersListResponse;
      UserSchema.validateUsersList(body);
    });
  });

  // ─── GET — Buscar usuário por ID ─────────────────────────────────────────────
  describe('GET /users/:id — Buscar por ID', function () {
    it('Validar busca de usuário existente pelo ID', async function () {
      const response = await userService.getUserById(validUserId);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const user = response.body as User;
      UserSchema.validateUser(user);
      expect(user.id).to.equal(validUserId);
    });

    it('Verificar presença dos campos obrigatórios no retorno do usuário', async function () {
      const response = await userService.getUserById(secondUserId);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const user = response.body as User;
      expect(user).to.have.property('firstName').that.is.a('string').and.not.empty;
      expect(user).to.have.property('email').that.is.a('string').and.not.empty;
      UserSchema.validateEmail(user.email);
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

      const body = response.body as UsersListResponse;
      expect(body).to.have.property('users').that.is.an('array');
      expect(body.users.length).to.be.greaterThan(0);
      body.users.forEach(user => UserSchema.validateUser(user));
    });

    it('Validar busca com termo sem resultados retorna lista vazia', async function () {
      const response = await userService.searchUsers('xyznotexistent999');
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = response.body as UsersListResponse;
      expect(body.users).to.be.an('array').that.is.empty;
    });
  });

  // ─── POST — Criar usuário ────────────────────────────────────────────────────
  describe('POST /users/add — Criar usuário', function () {
    it('Validar criação de usuário: status 201, ID positivo e campos espelhados no retorno', async function () {
      const payload = ApiUtils.generateUserPayload();
      UserSchema.validateCreatePayload(payload);

      const response = await userService.createUser(payload);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 201);
      ApiUtils.assertJsonContentType(response);

      const createdUser = response.body as User;
      expect(createdUser).to.have.property('id').that.is.a('number').and.greaterThan(0);
      expect(createdUser.firstName).to.equal(payload.firstName);
      expect(createdUser.lastName).to.equal(payload.lastName);
      expect(createdUser.email).to.equal(payload.email);
    });
  });

  // ─── PUT — Atualizar usuário ─────────────────────────────────────────────────
  describe('PUT /users/:id — Atualizar usuário', function () {
    it('Validar atualização do primeiro nome de usuário existente', async function () {
      const updatePayload = { firstName: 'UpdatedName' };
      const response = await userService.updateUser(validUserId, updatePayload);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const updatedUser = response.body as User;
      expect(updatedUser).to.have.property('id').that.equals(validUserId);
      expect(updatedUser.firstName).to.equal('UpdatedName');
    });

    it('Validar atualização de múltiplos campos simultaneamente', async function () {
      const updatePayload = {
        firstName: 'MultiUpdate',
        lastName:  'Tester',
        age:       35,
      };
      const response = await userService.updateUser(validUserId, updatePayload);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const updatedUser = response.body as User;
      expect(updatedUser.firstName).to.equal(updatePayload.firstName);
      expect(updatedUser.lastName).to.equal(updatePayload.lastName);
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
      const response = await userService.deleteUser(validUserId);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);
      ApiUtils.assertJsonContentType(response);

      const deletedUser = response.body as User & { isDeleted: boolean; deletedOn: string };
      expect(deletedUser).to.have.property('id').that.equals(validUserId);
      expect(deletedUser).to.have.property('isDeleted').that.equals(true);
      expect(deletedUser).to.have.property('deletedOn').that.is.a('string');
    });

    it('Verificar retorno do objeto deletado com flag isDeleted', async function () {
      const response = await userService.deleteUser(secondUserId);
      ApiUtils.storeLastResponse(response);

      ApiUtils.assertStatus(response, 200);

      const body = response.body;
      expect(body.isDeleted).to.be.true;
    });

    it('Verificar retorno 404 ao deletar usuário com ID inexistente', async function () {
      const response = await userService.deleteUser(99999);
      ApiUtils.storeLastResponse(response);
      ApiUtils.assertStatus(response, 404);
    });
  });

  // ─── Rate Limit ──────────────────────────────────────────────────────────────
  describe('Rate Limit — Limite de requisições por minuto', function () {
    it('Validar que a API responde dentro do limite de 100 req/min sem degradação', async function () {
      // Envia 10 requisições sequenciais e valida que nenhuma retorna 429.
      const results: number[] = [];

      for (let i = 0; i < 10; i++) {
        const response = await userService.getUserById(validUserId);
        ApiUtils.storeLastResponse(response);
        results.push(response.status);
      }

      const allSucceeded = results.every(status => status === 200);
      expect(allSucceeded).to.be.true;
      expect(results).to.not.include(429, 'API não deve retornar 429 (Too Many Requests) abaixo do limite');
    });
  });
});

import { expect } from 'chai';
import { User, UsersListResponse } from './user.types';


export const UserSchema = {
  /** Valida que um objeto possui os campos obrigatórios de um User. */
  validateUser(user: User): void {
    expect(user).to.be.an('object');
    expect(user).to.have.property('id').that.is.a('number');
    expect(user).to.have.property('firstName').that.is.a('string');
    expect(user).to.have.property('lastName').that.is.a('string');
    expect(user).to.have.property('email').that.is.a('string');
    expect(user).to.have.property('username').that.is.a('string');
    expect(user).to.have.property('age').that.is.a('number');
  },

  /** Valida o schema da resposta de listagem de usuários. */
  validateUsersList(response: UsersListResponse): void {
    expect(response).to.be.an('object');
    expect(response).to.have.property('users').that.is.an('array');
    expect(response).to.have.property('total').that.is.a('number');
    expect(response).to.have.property('skip').that.is.a('number');
    expect(response).to.have.property('limit').that.is.a('number');
    expect(response.users.length).to.be.greaterThan(0);

    // Valida amostra dos primeiros 3 usuários — evita falso positivo
    // quando apenas o primeiro item está válido e os demais corrompidos
    response.users.slice(0, 3).forEach(user => UserSchema.validateUser(user));
  },

  /** Valida que o email está em formato válido. */
  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(email).to.match(emailRegex, `Email inválido: ${email}`);
  },

  /** Valida payload de criação de usuário. */
  validateCreatePayload(payload: object): void {
    expect(payload).to.have.property('firstName').that.is.a('string').and.not.empty;
    expect(payload).to.have.property('lastName').that.is.a('string').and.not.empty;
    expect(payload).to.have.property('email').that.is.a('string').and.not.empty;
  }
};

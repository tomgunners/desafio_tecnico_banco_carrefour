import { LoginScreen } from '../pages/login.screen';
import { USERS } from '../utils/test.utils';

//Suíte: Login
 
describe('Login', () => {
  const login = new LoginScreen();
  
  beforeEach(async () => {
    await browser.reloadSession();
    await login.waitForScreen();
  });

  it('Verificar login com sucesso', async () => {
    await login.login(USERS.standard);
    await login.verifyLoginSuccess();
  });

  it('Validar erro ao informar senha inválida', async () => {
    await login.login({ username: USERS.standard.username, password: 'errada' });

    expect(await login.hasError()).toBe(true);
    expect(await login.getErrorMessage()).toContain('Please enter at least 8 characters');
    expect(await login.isActive()).toBe(true);
  });

  it('Validar erro ao informar email incorreto', async () => {
    await login.login(USERS.invalid);

    expect(await login.hasError()).toBe(true);
    expect(await login.getErrorMessage()).toContain('Please enter a valid email address');
  });

  it('Validar erro ao tentar login sem preencher os campos', async () => {
    await login.tapLoginWithoutCredentials();

    expect(await login.hasError()).toBe(true);
    expect(await login.getErrorMessage()).toBeTruthy();
  });
});

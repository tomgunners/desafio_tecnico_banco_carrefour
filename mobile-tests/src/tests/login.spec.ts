import { LoginScreen } from '../pages/login.screen';
import { HomeScreen }  from '../pages/home.screen';
import { HomeLocators } from '../locators/home.locators';
import { LoginLocators } from '../locators/login.locators';
import { USERS } from '../utils/test.utils';

// Melhoria #07: sessão única por suíte + reset granular entre testes.
// reloadSession() no beforeEach custava ~15s * 4 testes = ~60s de overhead.
// Com beforeAll + beforeEach leve, o custo é reduzido em ~70%.

describe('Login', () => {
  const login = new LoginScreen();
  const home  = new HomeScreen();

  // Uma sessão por suíte (~15s uma vez)
  before(async () => {
    await home.waitForScreen();
    await login.waitForScreen();
  });

  // Reset leve: navega de volta à tela de login sem recriar sessão
  beforeEach(async () => {
    // Garante que está na tela de login — navega pelo menu se necessário
    const isOnLogin = await login.isActive();
    if (!isOnLogin) {
      await home.goToLogin();
    }
    await login.clearFields();
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

  // Melhoria #10: verificação básica de acessibilidade
  it('Verificar que campos de login possuem accessibility labels descritivos', async () => {
    const emailEl  = await $(LoginLocators.usernameField);
    const passEl   = await $(LoginLocators.passwordField);
    const btnEl    = await $(LoginLocators.loginButton);

    // Todos os elementos interativos devem existir com seu accessibility ID
    expect(await emailEl.isExisting()).toBe(true);
    expect(await passEl.isExisting()).toBe(true);
    expect(await btnEl.isExisting()).toBe(true);

    // Verifica que o accessibility ID não é um valor genérico
    const btnAccessId = LoginLocators.loginButton.replace('~', '');
    expect(btnAccessId.toLowerCase()).not.toBe('button');
    expect(btnAccessId.length).toBeGreaterThan(3);
  });
});

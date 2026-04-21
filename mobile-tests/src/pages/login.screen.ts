import { BasePage } from './base.page';
import { LoginLocators } from '../locators/login.locators';
import { UserCredentials } from '../types/mobile.types';


export class LoginScreen extends BasePage {

  async waitForScreen(): Promise<void> {
    await this.tap(LoginLocators.loginMenu);
    await this.waitForDisplayed(LoginLocators.usernameField);
  }

  /**
   * Fecha qualquer dialog/overlay aberto usando o botão Voltar do Android.
   * Necessário após login bem-sucedido, que exibe um dialog de confirmação
   * que bloqueia a navegação da barra inferior.
   * Falha silenciosa — se não houver dialog, não causa erro.
   */
  async dismissOpenDialog(): Promise<void> {
    try {
      const dialogVisible = await this.isDisplayed(LoginLocators.successContainer);
      if (dialogVisible) {
        await browser.back();
        // Aguarda o dialog fechar antes de continuar
        await browser.pause(500);
      }
    } catch {
      // Sem dialog aberto — sem problema
    }
  }

  async login(credentials: UserCredentials): Promise<void> {
    await this.fill(LoginLocators.usernameField, credentials.username);
    await this.fill(LoginLocators.passwordField, credentials.password);
    await this.tap(LoginLocators.loginButton);
  }

  // Melhoria #07: método para limpar campos sem recriar sessão
  async clearFields(): Promise<void> {
    try {
      const emailEl = await $(LoginLocators.usernameField);
      const passEl  = await $(LoginLocators.passwordField);
      if (await emailEl.isDisplayed()) await emailEl.clearValue();
      if (await passEl.isDisplayed())  await passEl.clearValue();
    } catch {
      // Campos não visíveis — sem problema
    }
  }

  async verifyLoginSuccess(): Promise<void> {
    const container = await $(LoginLocators.successContainer);
    const textElements = await container.$$(LoginLocators.successTextElement);
    const allTexts = await Promise.all(
      Array.from(textElements).map(el => el.getText())
    );

    expect(allTexts).toContain('Success');
    expect(allTexts).toContain('You are logged in!');
  }

  async tapLoginWithoutCredentials(): Promise<void> {
    await this.tap(LoginLocators.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    const [emailVisible, passwordVisible] = await Promise.all([
      this.isDisplayed(LoginLocators.emailErrorMessage),
      this.isDisplayed(LoginLocators.passwordErrorMessage),
    ]);

    if (emailVisible)    return this.getText(LoginLocators.emailErrorMessage);
    if (passwordVisible) return this.getText(LoginLocators.passwordErrorMessage);
    return '';
  }

  async hasError(): Promise<boolean> {
    const [emailVisible, passwordVisible] = await Promise.all([
      this.isDisplayed(LoginLocators.emailErrorMessage),
      this.isDisplayed(LoginLocators.passwordErrorMessage),
    ]);
    return emailVisible || passwordVisible;
  }

  async isActive(): Promise<boolean> {
    return this.isDisplayed(LoginLocators.usernameField);
  }
}

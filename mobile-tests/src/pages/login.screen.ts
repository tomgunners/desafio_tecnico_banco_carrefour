import { BasePage } from './base.page';
import { LoginLocators } from '../locators/login.locators';
import { UserCredentials } from '../types/mobile.types';


export class LoginScreen extends BasePage {

  async waitForScreen(): Promise<void> {
    await this.tap(LoginLocators.loginMenu);
    await this.waitForDisplayed(LoginLocators.usernameField);
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
    // Aguarda o dialog aparecer com retry — o app pode demorar a exibi-lo
    const container = await this.waitForDisplayed(LoginLocators.successContainer);
    const textElements = await container.$$(LoginLocators.successTextElement);
    const allTexts = await Promise.all(
      Array.from(textElements).map(el => el.getText())
    );

    expect(allTexts).toContain('Success');
    expect(allTexts).toContain('You are logged in!');

    // IMPORTANTE: descarta o dialog imediatamente após verificar.
    // Responsabilidade do teste — não do beforeEach.
    // O botão OK (android:id/button1) é o botão positivo padrão do AlertDialog Android.
    await this.dismissSuccessDialog();
  }

  /**
   * Clica no botão OK do dialog de sucesso para fechá-lo.
   * Usa o ID de sistema android:id/button1 (positive button do AlertDialog).
   * Fallback: pressKeyCode(4) = botão Back do Android (mais confiável que browser.back()
   * em apps nativos via Appium).
   */
  async dismissSuccessDialog(): Promise<void> {
    try {
      const okButton = await $(LoginLocators.successOkButton);
      const isVisible = await okButton.isDisplayed();
      if (isVisible) {
        await okButton.click();
        await browser.pause(400); // aguarda animação de fechamento do dialog
        return;
      }
    } catch {
      // Botão OK não encontrado — tenta pressKeyCode como fallback
    }
    try {
      // pressKeyCode(4) = KEYCODE_BACK — método correto em Appium para apps nativos
      // browser.back() pode não funcionar em WebView ou estados de navegação específicos
      await browser.pressKeyCode(4);
      await browser.pause(400);
    } catch {
      // Nenhuma ação necessária
    }
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

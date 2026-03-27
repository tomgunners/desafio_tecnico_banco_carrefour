import { BasePage } from './base.page';
import { LoginLocators } from '../locators/login.locators';
import { UserCredentials } from '../types/mobile.types';


export class LoginScreen extends BasePage {

  async waitForScreen(): Promise<void> {
    await this.tap(LoginLocators.loginMenu);
  }

  async login(credentials: UserCredentials): Promise<void> {
    await this.fill(LoginLocators.usernameField, credentials.username);
    await this.fill(LoginLocators.passwordField, credentials.password);
    await this.tap(LoginLocators.loginButton);
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

    if (emailVisible) return this.getText(LoginLocators.emailErrorMessage);
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
    return this.isDisplayed(LoginLocators.loginButton);
  }
}

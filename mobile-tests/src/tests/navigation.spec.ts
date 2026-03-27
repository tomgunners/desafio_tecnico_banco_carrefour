import { HomeScreen } from '../pages/home.screen';
import { HomeLocators } from '../locators/home.locators';
import { LoginLocators } from '../locators/login.locators';
import { FormsLocators } from '../locators/forms.locators';

describe('Navegação entre telas', () => {
  const home = new HomeScreen();

  beforeEach(async () => {
    await browser.reloadSession();
    await home.waitForScreen();
  });

  it('Verificar que todos os itens do menu inferior estão visíveis na tela inicial', async () => {
    const menuItems = [
      HomeLocators.loginMenu,
      HomeLocators.formsMenu,
      HomeLocators.swipeMenu,
      HomeLocators.dragMenu,
      HomeLocators.webViewMenu,
    ];

    for (const item of menuItems) {
      const visible = await home.isMenuItemVisible(item);
      expect(visible).toBe(true);
    }
  });

  it('Verificar navegação para a tela de Login via menu inferior', async () => {
    await home.goToLogin();

    // A tela de Login deve exibir o campo de email após a navegação
    const loginFieldVisible = await home.isMenuItemVisible(LoginLocators.usernameField);
    expect(loginFieldVisible).toBe(true);
  });

  it('Verificar navegação para a tela de Formulários via menu inferior', async () => {
    await home.goToForms();

    // A tela de Forms deve exibir o campo de input após a navegação
    const formsFieldVisible = await home.isMenuItemVisible(FormsLocators.inputField);
    expect(formsFieldVisible).toBe(true);
  });
});

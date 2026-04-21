/**
 * Locators da tela de Login.
 *
 * Validados em: WDIO Native Demo App v2.0.0
 * Referência:   https://github.com/webdriverio/native-demo-app/releases/tag/v2.0.0
 *
 * Estratégia: Accessibility ID (~) — mais estável que XPath ou resource-id,
 * funciona em Android e iOS sem alteração.
 *
 * Se o app atualizar, revisar os locators abaixo antes de executar os testes.
 */
export const LoginLocators = {
  loginMenu:            '~Login',               // Tab do menu inferior
  usernameField:        '~input-email',         // TextInput — campo de email/usuário
  passwordField:        '~input-password',      // TextInput — campo de senha
  loginButton:          '~button-LOGIN',        // Button — submeter formulário
  emailErrorMessage:    '//*[@text="Please enter a valid email address"]',  // Erro de email
  passwordErrorMessage: '//*[@text="Please enter at least 8 characters"]', // Erro de senha

  successContainer:     'id=com.wdiodemoapp:id/parentPanel', // Dialog de sucesso (Android)
  successTextElement:   'android.widget.TextView',           // Textos dentro do dialog
  // Botão OK do AlertDialog padrão Android (android:id/button1 = positive button)
  // É um ID de sistema — funciona em qualquer AlertDialog nativo
  successOkButton:      'id=android:id/button1',
} as const;

export type LoginLocatorKey = keyof typeof LoginLocators;

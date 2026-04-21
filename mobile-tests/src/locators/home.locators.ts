/**
 * Locators da tela Home (menu inferior).
 *
 * Validados em: WDIO Native Demo App v2.0.0
 * Referência:   https://github.com/webdriverio/native-demo-app/releases/tag/v2.0.0
 */
export const HomeLocators = {
  webViewMenu:   '~Webview', // Tab do menu inferior
  loginMenu:     '~Login',
  formsMenu:     '~Forms',
  swipeMenu:     '~Swipe',
  dragMenu:      '~Drag',

  homeTitle:     '~Home',         // Título da tela inicial
  homeContainer: '~Home-screen',  // Container principal
} as const;

export type HomeLocatorKey = keyof typeof HomeLocators;

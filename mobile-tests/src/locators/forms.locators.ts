/**
 * Locators da tela de Formulários.
 *
 * Validados em: WDIO Native Demo App v2.0.0
 * Referência:   https://github.com/webdriverio/native-demo-app/releases/tag/v2.0.0
 */
export const FormsLocators = {
  formsMenu: '~Forms',              // Tab do menu inferior

  inputField:  '~text-input',       // TextInput — campo de texto livre
  inputResult: '~input-text-result',// Text — espelho do valor digitado

  switchToggle:      '~switch',     // Switch — toggle on/off
  switchActiveText:  '//*[@text="Click to turn the switch OFF"]',  // Estado: ativo
  switchInactiveText:'//*[@text="Click to turn the switch ON"]',   // Estado: inativo

  dropdownTrigger:    '~Dropdown',                                      // Abre o dropdown
  dropdownOptionOne:  '//*[@text="webdriver.io is awesome"]',           // Opção 1
  dropdownOptionTwo:  '//*[@text="Appium is awesome"]',                 // Opção 2
  dropdownOptionThree:'//*[@text="This app is awesome"]',               // Opção 3
  dropdownSelected:   '//android.widget.EditText[contains(@resource-id,"text_input")]', // Valor selecionado

  activeButton:   '~button-Active',   // Button — estado ativo
  inactiveButton: '~button-Inactive', // Button — estado inativo
} as const;

export type FormsLocatorKey = keyof typeof FormsLocators;

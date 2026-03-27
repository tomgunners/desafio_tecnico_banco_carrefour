export const FormsLocators = {
  formsMenu: '~Forms',

  inputField: '~text-input',
  inputResult: '~input-text-result',

  switchToggle: '~switch',
  switchActiveText: '//*[@text="Click to turn the switch OFF"]',
  switchInactiveText: '//*[@text="Click to turn the switch ON"]',

  dropdownTrigger: '~Dropdown',
  dropdownOptionOne: '//*[@text="webdriver.io is awesome"]',
  dropdownOptionTwo: '//*[@text="Appium is awesome"]',
  dropdownOptionThree: '//*[@text="This app is awesome"]',
  dropdownSelected: '//android.widget.EditText[contains(@resource-id,"text_input")]',

  activeButton: '~button-Active',
  inactiveButton: '~button-Inactive',
} as const;

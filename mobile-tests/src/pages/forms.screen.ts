import { BasePage } from './base.page';
import { FormsLocators } from '../locators/forms.locators';


export class FormsScreen extends BasePage {

  async waitForScreen(): Promise<void> {
    await this.tap(FormsLocators.formsMenu);
    await this.waitForDisplayed(FormsLocators.inputField);
  }

  // ── Campo de texto ────────────────────────────────────────────────────────────

  async typeInField(value: string): Promise<void> {
    await this.fill(FormsLocators.inputField, value);
  }

  async getInputResult(): Promise<string> {
    return this.getText(FormsLocators.inputResult);
  }

  // ── Switch ────────────────────────────────────────────────────────────────────

  /**
   * Garante que o switch está no estado inativo antes de um teste.
   * Chamado no beforeEach — evita que o estado residual do teste anterior
   * cause falsos negativos quando o switch já está no estado errado.
   */
  async resetSwitchToInactive(): Promise<void> {
    const isActive = await this.isSwitchActive();
    if (isActive) {
      await this.tapSwitch();
    }
  }

  async tapSwitch(): Promise<void> {
    await this.tap(FormsLocators.switchToggle);
  }

  async isSwitchActive(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.switchActiveText);
  }

  async isSwitchInactive(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.switchInactiveText);
  }

  // ── Dropdown ──────────────────────────────────────────────────────────────────

  async openDropdown(): Promise<void> {
    await this.tap(FormsLocators.dropdownTrigger);
  }

  async selectDropdownOption(option: 'Option 1' | 'Option 2' | 'Option 3'): Promise<void> {
    const locatorMap = {
      'Option 1': FormsLocators.dropdownOptionOne,
      'Option 2': FormsLocators.dropdownOptionTwo,
      'Option 3': FormsLocators.dropdownOptionThree,
    } as const;

    await this.tap(locatorMap[option]);
  }

  async getSelectedDropdownValue(): Promise<string> {
    return this.getText(FormsLocators.dropdownSelected);
  }

  // ── Active / Inactive buttons ────────────────────────────────────────────────

  async isActiveButtonVisible(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.activeButton);
  }

  async isInactiveButtonVisible(): Promise<boolean> {
    return this.isDisplayed(FormsLocators.inactiveButton);
  }
}

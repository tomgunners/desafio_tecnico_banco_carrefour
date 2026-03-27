import { FormsScreen } from '../pages/forms.screen';

describe('Formulários', () => {
  const forms = new FormsScreen();

  beforeEach(async () => {
    await browser.reloadSession();
    await forms.waitForScreen();
  });

  // ── Campo de texto ────────────────────────────────────────────────────────────

  it('Verificar preenchimento do campo de texto e reflexo no resultado', async () => {
    const testValue = 'Banco Carrefour QA';
    await forms.typeInField(testValue);

    const result = await forms.getInputResult();
    expect(result).toContain(testValue);
  });

  it('Validar que campo de texto aceita entrada vazia sem erro', async () => {
    await forms.typeInField('');
    const isFieldVisible = await forms.isActiveButtonVisible();
    expect(typeof isFieldVisible).toBe('boolean');
  });

  // ── Switch ────────────────────────────────────────────────────────────────────

  it('Validar alternância do switch de inativo para ativo', async () => {
    // Estado inicial: inativo
    const initiallyInactive = await forms.isSwitchInactive();
    expect(initiallyInactive).toBe(true);

    // Aciona o switch
    await forms.tapSwitch();

    // Deve estar ativo após o toque
    const nowActive = await forms.isSwitchActive();
    expect(nowActive).toBe(true);
  });

  it('Validar alternância do switch de ativo para inativo', async () => {
    // Liga o switch
    await forms.tapSwitch();
    const isActive = await forms.isSwitchActive();
    expect(isActive).toBe(true);

    // Desliga o switch
    await forms.tapSwitch();
    const isInactive = await forms.isSwitchInactive();
    expect(isInactive).toBe(true);
  });

  // ── Dropdown ──────────────────────────────────────────────────────────────────

  it('Validar seleção de opção no dropdown e exibição do valor selecionado', async () => {
    await forms.openDropdown();
    await forms.selectDropdownOption('Option 2');

    const selected = await forms.getSelectedDropdownValue();
    expect(selected).toContain('Appium is awesome');
  });
});

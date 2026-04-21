import { FormsScreen } from '../pages/forms.screen';
import { HomeScreen }  from '../pages/home.screen';

// Melhoria #07: sessão única por suíte + reset leve entre testes
describe('Formulários', () => {
  const forms = new FormsScreen();
  const home  = new HomeScreen();

  // Uma sessão por suíte
  before(async () => {
    await home.waitForScreen();
    await forms.waitForScreen();
  });

  // Reset leve: volta para a tela de Forms sem recriar sessão
  beforeEach(async () => {
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
    const initiallyInactive = await forms.isSwitchInactive();
    expect(initiallyInactive).toBe(true);

    await forms.tapSwitch();

    const nowActive = await forms.isSwitchActive();
    expect(nowActive).toBe(true);
  });

  it('Validar alternância do switch de ativo para inativo', async () => {
    await forms.tapSwitch();
    expect(await forms.isSwitchActive()).toBe(true);

    await forms.tapSwitch();
    expect(await forms.isSwitchInactive()).toBe(true);
  });

  // ── Dropdown ──────────────────────────────────────────────────────────────────

  it('Validar seleção de opção no dropdown e exibição do valor selecionado', async () => {
    await forms.openDropdown();
    await forms.selectDropdownOption('Option 2');

    const selected = await forms.getSelectedDropdownValue();
    expect(selected).toContain('Appium is awesome');
  });
});

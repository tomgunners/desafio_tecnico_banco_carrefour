/**
 * Utilitários de configuração de ambiente.
 *
 * DECISÃO: variáveis obrigatórias causam falha explícita e ruidosa.
 * Nunca usar fallback hardcoded — ausência de env var deve ser visível imediatamente,
 * não mascarada por um valor padrão que pode comprometer segurança ou cobertura.
 */

/**
 * Retorna o valor da variável de ambiente ou lança erro claro com nome da variável.
 * Usar para qualquer variável sem a qual os testes não fazem sentido executar.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Variável de ambiente obrigatória ausente ou vazia: "${key}"\n` +
      `      Copie api-tests/.env.example → api-tests/.env e preencha os valores.\n` +
      `      Em CI, configure o secret correspondente no GitHub Actions.`
    );
  }
  return value;
}

/**
 * Lista de variáveis obrigatórias para a suíte de API.
 * Chamado no setup.ts — falha rápida antes de qualquer teste.
 */
const REQUIRED_VARS = ['AUTH_USERNAME', 'AUTH_PASSWORD', 'API_BASE_URL'];

export function validateRequiredEnvVars(): void {
  const missing = REQUIRED_VARS.filter(k => !process.env[k]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `[env] Variáveis obrigatórias ausentes: ${missing.join(', ')}\n` +
      `      Copie api-tests/.env.example → api-tests/.env e preencha os valores.`
    );
  }
}

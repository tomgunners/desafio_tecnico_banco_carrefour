import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { validateRequiredEnvVars } from './env';

// Projeto usa ts-node com module CommonJS — __dirname sempre disponível.
// Se no futuro migrar para ESM, substituir por:
//   import { fileURLToPath } from 'url';
//   const _dirname = path.dirname(fileURLToPath(import.meta.url));
const _dirname = __dirname;

// ── ENV ───────────────────────────────────────────────────────────────────────

dotenv.config({ path: path.resolve(_dirname, '../../.env') });

// Valida variáveis obrigatórias imediatamente — falha antes do primeiro teste
validateRequiredEnvVars();

// ── Diretórios ────────────────────────────────────────────────────────────────

const REPORTS_DIR        = path.resolve(_dirname, '../../reports');
const ALLURE_RESULTS_DIR = path.resolve(_dirname, '../../allure-results');
const ALLURE_REPORT_DIR  = path.resolve(_dirname, '../../allure-report');

const HISTORY_FROM = path.join(ALLURE_REPORT_DIR, 'history');
const HISTORY_TO   = path.join(ALLURE_RESULTS_DIR, 'history');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

for (const dir of [REPORTS_DIR, ALLURE_RESULTS_DIR]) {
  ensureDir(dir);
}

// ── Restaura histórico de trend do Allure ─────────────────────────────────────

function restoreHistory() {
  if (fs.existsSync(HISTORY_FROM)) {
    ensureDir(HISTORY_TO);
    fs.cpSync(HISTORY_FROM, HISTORY_TO, { recursive: true });
    console.log('Histórico Allure restaurado com sucesso');
  } else {
    console.log('Nenhum histórico anterior encontrado — primeiro run');
  }
}

restoreHistory();

// ── Metadados ─────────────────────────────────────────────────────────────────

const isCI =
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true';

// ── Environment ───────────────────────────────────────────────────────────────

fs.writeFileSync(
  path.join(ALLURE_RESULTS_DIR, 'environment.properties'),
  [
    `API.BaseUrl=${process.env.API_BASE_URL}`,
    `Execution.Type=${isCI ? 'CI/CD' : 'Local'}`,
    `Environment=${process.env.TEST_ENV ?? 'QA'}`,
    `Node.Version=${process.version}`,
    `OS=${os.type()} ${os.release()}`,
    `Machine=${os.hostname()}`,
  ].join('\n')
);

// ── Executor ──────────────────────────────────────────────────────────────────

fs.writeFileSync(
  path.join(ALLURE_RESULTS_DIR, 'executor.json'),
  JSON.stringify({
    name: process.env.GITHUB_ACTIONS ? 'GitHub Actions' : 'Local Machine',
    type: isCI ? 'pipeline' : 'local',
    buildName: process.env.GITHUB_WORKFLOW ?? 'Local Test Execution',
    buildOrder: process.env.GITHUB_RUN_NUMBER ?? String(Date.now()),
    buildUrl:
      process.env.GITHUB_SERVER_URL &&
      process.env.GITHUB_REPOSITORY &&
      process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : '',
  }, null, 2)
);

// ── Categories ────────────────────────────────────────────────────────────────

fs.writeFileSync(
  path.join(ALLURE_RESULTS_DIR, 'categories.json'),
  JSON.stringify([
    { name: 'Assertion Failures',   matchedStatuses: ['failed'],  traceRegex:   '.*AssertionError.*' },
    { name: 'Authentication Errors',matchedStatuses: ['failed'],  messageRegex: '.*401.*|.*403.*|.*token.*|.*auth.*' },
    { name: 'Rate Limit Exceeded',  matchedStatuses: ['failed'],  messageRegex: '.*429.*|.*Too Many Requests.*' },
    { name: 'Network Errors',       matchedStatuses: ['broken'],  messageRegex: '.*ECONNREFUSED.*|.*ENOTFOUND.*|.*ECONNRESET.*' },
    { name: 'Timeout Errors',       matchedStatuses: ['broken'],  messageRegex: '.*ETIMEDOUT.*|.*timed out.*' },
    { name: 'Schema Violations',    matchedStatuses: ['failed'],  messageRegex: '.*Schema inválido.*|.*ajv.*|.*must have required property.*' },
  ], null, 2)
);

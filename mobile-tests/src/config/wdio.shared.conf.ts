/**
 * Configuração compartilhada WebdriverIO.
 *
 * ── DECISÃO ARQUITETURAL: Frameworks de Assertion ─────────────────────────
 * API tests:    Mocha + Chai   → expect(x).to.equal(y)
 * Mobile tests: WDIO + Jasmine → expect(x).toBe(y)
 *
 * Motivo: Mocha+Chai tem integração nativa com allure-mocha para API.
 * WDIO usa Jasmine nativamente com expect-webdriverio, que provê matchers
 * específicos para browser/mobile (toBeDisplayed, toHaveText, etc.).
 *
 * Para unificar no futuro: avaliar migração de API tests para Vitest (jest-compatible).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ── DECISÃO ARQUITETURAL: Sessão por Suíte (beforeAll vs beforeEach) ─────
 * Cada reloadSession() custa ~15s em emuladores.
 * Padrão adotado: 1 sessão por describe, reset leve (clearFields/navigate) entre testes.
 * Cenários que exigem estado totalmente limpo podem usar reloadSession() explicitamente.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { Options } from '@wdio/types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { setupAllure } from '../utils/allure-setup';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const sharedConfig: Partial<Options.Testrunner> = {

  runner: 'local',
  specs: [path.join(__dirname, '..', 'tests', '**', '*.spec.ts')],
  exclude: [],
  maxInstances: 1,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: Number(process.env.TEST_TIMEOUT ?? 120000),
  },

  reporters: [
    ['spec', {
      addConsoleLogs:    true,
      realtimeReporting: true,
      color:             true,
    }],
    ['allure', {
      outputDir:                            'allure-results',
      disableWebdriverStepsReporting:       false,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter:              false,
    }],
  ],

  onPrepare() {
    const allureResultsDir = 'allure-results';
    if (fs.existsSync(allureResultsDir)) {
      fs.rmSync(allureResultsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(allureResultsDir, { recursive: true });

    setupAllure();

    for (const dir of ['reports/screenshots']) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  },

  beforeSuite(suite) {
    console.log(`\nIniciando suíte: ${suite.title}`);
  },

  // Melhoria #08: screenshot + log de erro automático em QUALQUER falha
  async afterTest(test, _ctx, { passed, error }) {
    if (!passed) {
      const testTitle = test.title ?? 'unknown_test';
      const safeTitle = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      // Screenshot
      try {
        const screenshotBase64 = await browser.takeScreenshot();

        if (screenshotBase64) {
          const screenshotDir = 'reports/screenshots';
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }

          const filePath = path.join(screenshotDir, `FAIL_${safeTitle}_${Date.now()}.png`);
          fs.writeFileSync(filePath, Buffer.from(screenshotBase64, 'base64'));

          await browser.call(async () => {
            const allure = require('@wdio/allure-reporter').default;
            allure.addAttachment(
              `Screenshot — ${testTitle}`,
              Buffer.from(screenshotBase64, 'base64'),
              'image/png',
            );
          });

          console.error(`[afterTest] Screenshot salvo: ${filePath}`);
        }
      } catch (screenshotErr) {
        console.error('[afterTest] Falha ao capturar screenshot:', screenshotErr);
      }

      // Log de erro no Allure
      try {
        const errorMessage = error?.message ?? 'Erro desconhecido';
        const errorStack   = error?.stack   ?? '';

        await browser.call(async () => {
          const allure = require('@wdio/allure-reporter').default;
          allure.addAttachment(
            `Error Log — ${testTitle}`,
            `Mensagem: ${errorMessage}\n\nStack:\n${errorStack}`,
            'text/plain',
          );
        });

        console.error(`\n[afterTest] Falha em "${testTitle}": ${errorMessage}`);
      } catch (logErr) {
        console.error('[afterTest] Falha ao registrar log no Allure:', logErr);
      }
    }
  },

  onComplete(_exitCode, _config, _caps, results) {
    const failed = results?.failed ?? 0;
    const passed = results?.passed ?? 0;
    const total  = passed + failed;

    console.log('\n════════════════════════════════════════════════');
    console.log('  Suíte Mobile finalizada                       ');
    console.log('════════════════════════════════════════════════');
    console.log(`Passou : ${passed}`);
    console.log(`Falhou : ${failed}`);
    console.log(`Total  : ${total}`);
    console.log('Execute: [yarn test:mobile:allure] → relatório Allure');
    console.log('════════════════════════════════════════════════\n');
  },
};

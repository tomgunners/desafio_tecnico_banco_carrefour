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

  /**
   * Executado uma vez antes de todas as sessões.
   *
   * Ordem das operações:
   *   1. clearAllureResults() — apaga resultados anteriores (pasta recriada vazia)
   *   2. setupAllure()        — restaura history/ + escreve environment, executor, categories
   *   3. Recria diretórios de saída
   *
   * A ordem importa: se setupAllure() viesse antes, a limpeza apagaria
   * environment.properties, executor.json e categories.json recém-criados.
   */
  onPrepare() {
    // 1. Limpa tudo — pasta allure-results/ recriada vazia
    const allureResultsDir = 'allure-results';
    if (fs.existsSync(allureResultsDir)) {
      fs.rmSync(allureResultsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(allureResultsDir, { recursive: true });

    // 2. Setup do Allure: restaura history/ de allure-report/history + gera metadados
    setupAllure();

    // 3. Diretórios de saída
    for (const dir of ['reports/screenshots']) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  },

  beforeSuite(suite) {
    console.log(`\nIniciando: ${suite.title}`);
  },

  async afterTest(test, _ctx, { passed, error }) {
    if (!passed) {
      const testTitle = test.title ?? 'unknown_test';

      try {
        const screenshotBase64 = await browser.takeScreenshot();

        if (screenshotBase64) {
          const safeTitle     = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const screenshotDir = 'reports/screenshots';

          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }

          const filePath = path.join(screenshotDir, `${safeTitle}_${Date.now()}.png`);
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

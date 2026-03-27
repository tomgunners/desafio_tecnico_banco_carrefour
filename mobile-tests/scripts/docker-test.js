#!/usr/bin/env node
/**
 * Script de orquestração para execução dos testes com docker-android.
 * Uso (chamado por npm run docker:test):
 *   node scripts/docker-test.js
 */

const { execSync, spawnSync } = require('child_process');

const CONTAINER_NAME     = process.env.DOCKER_CONTAINER_NAME     ?? 'mobile-tests-android-1';
const APP_CONTAINER_PATH = process.env.ANDROID_APP_CONTAINER_PATH ?? '/apps/wdio-native-demo-app.apk';
const BOOT_TIMEOUT_MS    = Number(process.env.BOOT_TIMEOUT ?? 180_000); // 3 min
const BOOT_INTERVAL_MS   = 10_000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── 1. Aguardar boot completo do emulador ─────────────────────────────────────
async function waitForEmulator() {
  console.log('\n Aguardando boot completo do emulador Android...');

  const deadline = Date.now() + BOOT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const result = execSync(
        `docker exec ${CONTAINER_NAME} adb shell getprop sys.boot_completed`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (result === '1') {
        console.log('Emulador inicializado (sys.boot_completed=1)\n');
        return true;
      }
    } catch {
      // Container ainda inicializando ou ADB não disponível — continua tentando
    }

    process.stdout.write('.');
    await sleep(BOOT_INTERVAL_MS);
  }

  return false;
}

// ── 2. Main ───────────────────────────────────────────────────────────────────
async function main() {
  const booted = await waitForEmulator();

  if (!booted) {
    console.error(`\nEmulador não inicializou em ${BOOT_TIMEOUT_MS / 1000}s.`);
    console.error('  Verifique os logs: docker logs ' + CONTAINER_NAME);
    process.exit(1);
  }

  console.log(`Iniciando testes com appium:app = ${APP_CONTAINER_PATH}\n`);

  const env = {
    ...process.env,
    ANDROID_APP_CONTAINER_PATH: APP_CONTAINER_PATH,
  };

  // Usa npx wdio diretamente para evitar dupla resolução de path no Windows
  const result = spawnSync(
    'npx',
    ['wdio', 'run', 'src/config/wdio.android.conf.ts'],
    { env, stdio: 'inherit', shell: true }
  );

  process.exit(result.status ?? 1);
}

main();

#!/usr/bin/env node
/**
 * scripts/docker-test.js
 *
 * Script de orquestração para execução dos testes com docker-android.
 * Resolve dois problemas que ocorrem ao rodar via npm scripts no Windows:
 *
 *   1. ANDROID_APP_CONTAINER_PATH não é injetado automaticamente no
 *      processo filho — este script define process.env antes do spawn.
 *
 *   2. O wait-for-appium.js confirma que o *servidor* Appium está de pé,
 *      mas o *emulador* pode ainda estar inicializando. Este script aguarda
 *      sys.boot_completed via `docker exec` antes de iniciar os testes.
 *
 * Uso (chamado por npm run docker:test):
 *   node scripts/docker-test.js
 */

const { execSync, spawnSync } = require('child_process');

const CONTAINER_NAME    = process.env.DOCKER_CONTAINER_NAME    ?? 'mobile-tests-android-1';
const APP_CONTAINER_PATH = process.env.ANDROID_APP_CONTAINER_PATH ?? '/apps/wdio-native-demo-app.apk';
const BOOT_TIMEOUT_MS   = Number(process.env.BOOT_TIMEOUT ?? 180_000); // 3 min
const BOOT_INTERVAL_MS  = 10_000;

// ── 1. Aguardar boot completo do emulador ─────────────────────────────────────
console.log('\n⏳ Aguardando boot completo do emulador Android...');

const deadline = Date.now() + BOOT_TIMEOUT_MS;
let booted = false;

while (Date.now() < deadline) {
  try {
    const result = execSync(
      `docker exec ${CONTAINER_NAME} adb shell getprop sys.boot_completed`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    if (result === '1') {
      booted = true;
      console.log('✔ Emulador inicializado (sys.boot_completed=1)\n');
      break;
    }
  } catch {
    // Container ainda inicializando ou ADB não disponível — continua tentando
  }

  process.stdout.write('.');
  execSync(`node -e "setTimeout(()=>{},${BOOT_INTERVAL_MS})"`, { stdio: 'inherit' });
}

if (!booted) {
  console.error(`\n✖ Emulador não inicializou em ${BOOT_TIMEOUT_MS / 1000}s.`);
  console.error('  Verifique os logs: docker logs ' + CONTAINER_NAME);
  process.exit(1);
}

// ── 2. Injetar ANDROID_APP_CONTAINER_PATH e executar os testes ───────────────
console.log(`🚀 Iniciando testes com appium:app = ${APP_CONTAINER_PATH}\n`);

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
EOF
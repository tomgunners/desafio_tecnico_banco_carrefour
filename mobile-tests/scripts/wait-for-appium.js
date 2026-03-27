#!/usr/bin/env node
/**
 * scripts/wait-for-appium.js
 *
 * Aguarda o servidor Appium dentro do container docker-android responder.
 */

const http = require('http');

const HOST     = process.env.APPIUM_HOST    ?? '127.0.0.1';
const PORT     = Number(process.env.APPIUM_PORT ?? 4723);
const TIMEOUT  = Number(process.env.WAIT_TIMEOUT ?? 180_000);
const INTERVAL = 5_000;

const deadline = Date.now() + TIMEOUT;

function check() {
  const req = http.get(
    { hostname: HOST, port: PORT, path: '/status', timeout: 4000 },
    (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json?.value?.ready === true || res.statusCode === 200) {
            console.log(`\n Appium disponível em http://${HOST}:${PORT}/status`);
            process.exit(0);
          }
        } catch { /* ainda não pronto */ }
        retry();
      });
    }
  );
  req.on('error', retry);
  req.on('timeout', () => { req.destroy(); retry(); });
}

function retry() {
  if (Date.now() >= deadline) {
    console.error(`\n Appium não respondeu em ${TIMEOUT / 1000}s.`);
    process.exit(1);
  }
  process.stdout.write('.');
  setTimeout(check, INTERVAL);
}

console.log(`Aguardando Appium em http://${HOST}:${PORT}/status (timeout: ${TIMEOUT / 1000}s)...`);
check();

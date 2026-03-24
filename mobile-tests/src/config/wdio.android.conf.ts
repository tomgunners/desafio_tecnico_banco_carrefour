import type { Options } from '@wdio/types';
import * as path from 'path';
import { sharedConfig } from './wdio.shared.conf';


const APP_PATH =
  process.env.ANDROID_APP_CONTAINER_PATH ??
  path.resolve(__dirname, '../../apps', process.env.ANDROID_APP_NAME ?? 'wdio-native-demo-app.apk');

export const config: Options.Testrunner = {
  ...sharedConfig,

  // ── Conexão com o Appium ───────────────────────────────────────────────────
  // Local  : Appium iniciado manualmente na porta 4723
  // CI     : Appium embutido no container docker-android, exposto na porta 4723
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port:     Number(process.env.APPIUM_PORT ?? 4723),
  path:     '/',

  // ── Capabilities Android ───────────────────────────────────────────────────
  capabilities: [{
    platformName: 'Android',

    'appium:automationName': 'UiAutomator2',

    // Local  : versão do emulador/dispositivo físico (adb shell getprop ro.build.version.release)
    // CI     : versão da imagem docker-android (ex: emulator_15 → '15)
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '15',

    // Serial do emulador — docker-android expõe sempre como emulator-5554
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME ?? 'emulator-5554',

    // Local  : path absoluto no filesystem do desenvolvedor
    // CI     : path dentro do container (/apps/wdio-native-demo-app.apk)
    'appium:app': APP_PATH,

    'appium:noReset':             false,
    'appium:fullReset':           false,
    'appium:autoGrantPermissions': true,

    'appium:newCommandTimeout':    Number(process.env.APPIUM_COMMAND_TIMEOUT ?? 300),
    'appium:androidInstallTimeout': 90000,
    'appium:adbExecTimeout':        60000,
  }],
};

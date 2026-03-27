import type { Options } from '@wdio/types';
import * as path from 'path';
import { sharedConfig } from './wdio.shared.conf';

const APP_PATH =
  process.env.ANDROID_APP_CONTAINER_PATH ??
  path.resolve(__dirname, '../../apps', process.env.ANDROID_APP_NAME ?? 'wdio-native-demo-app.apk');

export const config: Options.Testrunner = {
  ...sharedConfig,

  // ── Conexão com o Appium ───────────────────────────────────────────────────
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port:     Number(process.env.APPIUM_PORT ?? 4723),
  path:     '/',
  waitforTimeout: Number(process.env.WDIO_WAIT_TIMEOUT ?? 15000),
  waitforInterval: 500,

  // ── Capabilities Android ───────────────────────────────────────────────────
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION ?? '14',
    'appium:deviceName':      process.env.ANDROID_DEVICE_NAME ?? 'emulator-5554',
    'appium:app':             APP_PATH,
    'appium:noReset':             false,
    'appium:fullReset':           false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout':    Number(process.env.APPIUM_COMMAND_TIMEOUT ?? 300),
    'appium:androidInstallTimeout': 90000,
    'appium:adbExecTimeout':        60000,
    'appium:implicitWaitTimeout':   Number(process.env.APPIUM_IMPLICIT_WAIT ?? 10000),
  }],
};

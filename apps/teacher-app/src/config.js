import { NativeModules, Platform } from 'react-native';

/**
 * Where the IGNITE API lives.
 *
 * By default the host is taken from whatever machine served the Metro bundle,
 * so the same build works on a simulator, an emulator (via `adb reverse`) and a
 * physical phone on the LAN without editing anything. Set API_BASE_URL_OVERRIDE
 * to pin it to a fixed address (e.g. a staging server).
 */
const API_BASE_URL_OVERRIDE = null;

const API_PORT = 4000;

function metroHost() {
  // Expo Constants is the reliable source. On React Native 0.81 / the new
  // architecture `NativeModules.SourceCode.scriptURL` is undefined, so the old
  // scriptURL-only lookup silently fell through to 'localhost' — which on a
  // phone or emulator means the device itself, not the machine running the
  // API. The app could then only ever reach a server on the same host.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const Constants = require('expo-constants').default;
    const hostUri =
      Constants?.expoConfig?.hostUri ??
      Constants?.expoGoConfig?.debuggerHost ??
      Constants?.manifest?.debuggerHost ??
      Constants?.manifest2?.extra?.expoGo?.debuggerHost;
    const host = hostUri?.split(':')[0];
    if (host) return host;
  } catch (e) {
    // expo-constants missing — fall through to the legacy lookups below.
  }

  // Legacy path, still correct on older runtimes.
  // e.g. "http://192.168.0.101:8081/index.bundle?platform=ios&dev=true"
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  const match = /^https?:\/\/([^:/]+)/.exec(scriptURL ?? '');
  if (match) return match[1];

  // Last resort. On an Android emulator 10.0.2.2 is the host loopback;
  // 'localhost' there would be the emulator itself and never reach the API.
  if (Platform.OS === 'android' && !Constants_isDevice()) return '10.0.2.2';
  return 'localhost';
}

/** Emulators report isDevice false; a real handset reports true. */
function Constants_isDevice() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    return !!require('expo-constants').default?.isDevice;
  } catch (e) {
    return true;
  }
}

export const API_BASE_URL =
  API_BASE_URL_OVERRIDE ?? `http://${metroHost()}:${API_PORT}/api`;

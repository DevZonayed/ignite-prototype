import { NativeModules } from 'react-native';

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
  // e.g. "http://192.168.0.101:8081/index.bundle?platform=ios&dev=true"
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  const match = /^https?:\/\/([^:/]+)/.exec(scriptURL ?? '');
  return match ? match[1] : 'localhost';
}

export const API_BASE_URL =
  API_BASE_URL_OVERRIDE ?? `http://${metroHost()}:${API_PORT}/api`;

const ENV_TO_CONFIG = [
  ['VITE_FIREBASE_API_KEY', 'apiKey'],
  ['VITE_FIREBASE_AUTH_DOMAIN', 'authDomain'],
  ['VITE_FIREBASE_PROJECT_ID', 'projectId'],
  ['VITE_FIREBASE_STORAGE_BUCKET', 'storageBucket'],
  ['VITE_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'],
  ['VITE_FIREBASE_APP_ID', 'appId'],
];

export function getMissingFirebaseEnvKeys() {
  return ENV_TO_CONFIG.filter(([envKey]) => !String(import.meta.env[envKey] ?? '').trim()).map(
    ([envKey]) => envKey,
  );
}

export function getFirebaseConfig() {
  return Object.fromEntries(
    ENV_TO_CONFIG.map(([envKey, configKey]) => [configKey, import.meta.env[envKey]]),
  );
}

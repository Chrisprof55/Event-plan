import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig, getMissingFirebaseEnvKeys } from './utils/firebaseConfig';

export const missingFirebaseEnvKeys = getMissingFirebaseEnvKeys();
export const isFirebaseConfigured = missingFirebaseEnvKeys.length === 0;

const firebaseConfig = getFirebaseConfig();

function createFirestore(app) {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager(),
      }),
    });
  } catch (err) {
    console.warn('Firestore persistence unavailable, using default cache.', err);
    return getFirestore(app);
  }
}

let app = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = createFirestore(app);
  storage = getStorage(app);
} else {
  console.error(
    'Firebase is not configured. Missing environment variables:',
    missingFirebaseEnvKeys.join(', '),
  );
}

export { app, db, storage };

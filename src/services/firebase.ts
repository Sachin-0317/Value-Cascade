// Firebase is only initialized when every required env var is present.
// Otherwise the app runs entirely on the mock service layer, so the
// prototype works out of the box with zero configuration.

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = requiredVars.every(
  (key) => typeof import.meta.env[key] === 'string' && import.meta.env[key].length > 0
);

export const USE_MOCK_MODE = !isFirebaseConfigured;

let firebaseApp: unknown = null;

export async function getFirebaseApp() {
  if (!isFirebaseConfigured) return null;
  if (firebaseApp) return firebaseApp;
  const { initializeApp } = await import('firebase/app');
  firebaseApp = initializeApp(firebaseConfig);
  return firebaseApp;
}

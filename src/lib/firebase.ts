/**
 * Firebase bootstrap.
 *
 * Everything here is loaded dynamically so the Firebase SDK is only downloaded
 * on the pages that actually need it (news + admin). The marketing pages stay
 * light.
 *
 * The config values below are *public by design* — Firebase web config is not a
 * secret. Access is controlled by Firestore Security Rules and Firebase Auth,
 * which live in firestore.rules.
 */
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True once the NEXT_PUBLIC_FIREBASE_* variables are filled in. Until then the
 * site still builds and runs — the news page shows an empty state and the admin
 * area explains what to configure, instead of throwing.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let appPromise: Promise<FirebaseApp> | null = null;

async function getApp(): Promise<FirebaseApp> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env.local and fill in " +
        "the NEXT_PUBLIC_FIREBASE_* values from your Firebase project settings."
    );
  }

  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, getApp: getExisting } = await import(
        "firebase/app"
      );
      return getApps().length
        ? getExisting()
        : initializeApp(config as Required<typeof config>);
    })();
  }

  return appPromise;
}

/**
 * Point the SDK at the local Firebase emulators instead of the real project.
 * Enabled by NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true in .env.local — see
 * `npm run emulate` in SETUP.md. Never true in a production build.
 */
const useEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

let dbPromise: Promise<Firestore> | null = null;

export async function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const app = await getApp();
      const { getFirestore, connectFirestoreEmulator } = await import(
        "firebase/firestore"
      );
      const db = getFirestore(app);
      if (useEmulators) connectFirestoreEmulator(db, "127.0.0.1", 8080);
      return db;
    })();
  }
  return dbPromise;
}

let authPromise: Promise<Auth> | null = null;

export async function getAuthClient(): Promise<Auth> {
  if (!authPromise) {
    authPromise = (async () => {
      const app = await getApp();
      const {
        getAuth,
        setPersistence,
        browserLocalPersistence,
        connectAuthEmulator,
      } = await import("firebase/auth");

      const auth = getAuth(app);
      if (useEmulators) {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
      }
      // Keep the founders signed in between visits.
      await setPersistence(auth, browserLocalPersistence);
      return auth;
    })();
  }
  return authPromise;
}

/** Turns Firebase's error codes into something a human can act on. */
export function describeAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact whoever set up the site.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Wrong email or password. Check both and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a minute, then try again.";
    case "auth/network-request-failed":
      return "Couldn't reach Firebase. Check your internet connection.";
    case "auth/missing-password":
      return "Enter your password.";
    case "auth/weak-password":
      return "Passwords need to be at least 6 characters.";
    case "permission-denied":
      return "Your account isn't allowed to do that.";
    default:
      return error instanceof Error
        ? error.message
        : "Something went wrong. Try again.";
  }
}

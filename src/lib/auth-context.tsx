"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getAuthClient, getDb, isFirebaseConfigured } from "./firebase";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthState {
  /** null once we know nobody is signed in. */
  user: AdminUser | null;
  /** Whether that account has a document in the `admins` collection. */
  isAdmin: boolean;
  /** True until the first auth check settles — render a spinner, not a redirect. */
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // With no Firebase project there is nothing to wait for, so this starts
  // settled instead of being flipped by an effect.
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const auth = await getAuthClient();
      const { onAuthStateChanged } = await import("firebase/auth");

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (cancelled) return;

        if (!firebaseUser) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName:
            firebaseUser.displayName || (firebaseUser.email ?? "").split("@")[0],
        });

        // Membership of `admins` is what actually grants write access; the
        // Firestore rules check the same document on every write.
        try {
          const db = await getDb();
          const { doc, getDoc } = await import("firebase/firestore");
          const snap = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (!cancelled) setIsAdmin(snap.exists());
        } catch (error) {
          console.error("Could not verify admin membership", error);
          if (!cancelled) setIsAdmin(false);
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = await getAuthClient();
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    const auth = await getAuthClient();
    const { signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(auth);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const auth = await getAuthClient();
    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(auth, email);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    const auth = await getAuthClient();
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } =
      await import("firebase/auth");

    const current_ = auth.currentUser;
    if (!current_?.email) throw new Error("You are not signed in.");

    // Firebase requires a recent sign-in before a password change.
    await reauthenticateWithCredential(
      current_,
      EmailAuthProvider.credential(current_.email, current)
    );
    await updatePassword(current_, next);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAdmin,
      loading,
      configured,
      signIn,
      signOut,
      sendPasswordReset,
      changePassword,
    }),
    [
      user,
      isAdmin,
      loading,
      configured,
      signIn,
      signOut,
      sendPasswordReset,
      changePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

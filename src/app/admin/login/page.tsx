"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { CenteredCard } from "@/components/admin/admin-shell";
import { Field, Input, Notice } from "@/components/form";
import { Logo } from "@/components/logo";
import { Button, ButtonLink } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { describeAuthError } from "@/lib/firebase";

type Mode = "signin" | "reset";

export default function LoginPage() {
  const { user, loading, configured, signIn, sendPasswordReset } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // Already signed in? Go straight through.
  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  if (!configured) {
    return (
      <CenteredCard>
        <Logo />
        <h1 className="mt-6 text-xl">Firebase isn’t connected yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-body">
          Sign-in needs a Firebase project. Follow{" "}
          <code className="font-mono text-xs">SETUP.md</code> to create one and
          fill in <code className="font-mono text-xs">.env.local</code>.
        </p>
        <ButtonLink href="/" variant="outline" className="mt-7">
          Back to the site
        </ButtonLink>
      </CenteredCard>
    );
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <CenteredCard>
      <Logo />

      {mode === "signin" ? (
        <>
          <h1 className="mt-6 text-xl">Team sign in</h1>
          <p className="mt-2 text-sm text-ink-body">
            Sign in to write and publish updates.
          </p>

          <form onSubmit={handleSignIn} className="mt-7 space-y-5">
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hailstrum.com"
              />
            </Field>

            <Field label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setError("");
            }}
            className="mt-5 text-sm text-accent-ink underline underline-offset-4"
          >
            Forgot your password?
          </button>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-xl">Reset your password</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-body">
            Enter the email address on your account and Firebase will send you a
            link to choose a new password.
          </p>

          {sent ? (
            <Notice tone="success">
              <p className="font-semibold">Check your inbox.</p>
              <p className="mt-1">
                If an account exists for {email}, a reset link is on its way. It
                can take a minute, and it sometimes lands in spam.
              </p>
            </Notice>
          ) : (
            <form onSubmit={handleReset} className="mt-7 space-y-5">
              <Field label="Email" htmlFor="reset-email" required>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hailstrum.com"
                />
              </Field>

              {error && <Notice tone="error">{error}</Notice>}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSent(false);
            }}
            className="mt-5 text-sm text-accent-ink underline underline-offset-4"
          >
            Back to sign in
          </button>
        </>
      )}

      <p className="mt-8 border-t border-line pt-5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink">
          ← Back to hailstrum.com
        </Link>
      </p>
    </CenteredCard>
  );
}

"use client";

import { useState, type FormEvent } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Field, Input, Notice } from "@/components/form";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { describeAuthError } from "@/lib/firebase";

export default function AccountPage() {
  return (
    <AdminShell title="Account">
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <Details />
        <ChangePassword />
      </div>
    </AdminShell>
  );
}

function Details() {
  const { user, sendPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function emailResetLink() {
    if (!user?.email) return;
    setBusy(true);
    setError("");
    try {
      await sendPasswordReset(user.email);
      setSent(true);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 md:p-7">
      <h2 className="text-base">Signed in as</h2>
      <p className="mt-2 text-sm text-ink-body">{user?.email}</p>

      <p className="mt-6 text-sm leading-relaxed text-ink-muted">
        Password resets go to this address. If you ever get locked out, use
        &ldquo;Forgot your password?&rdquo; on the sign-in page.
      </p>

      {sent ? (
        <div className="mt-5">
          <Notice tone="success">
            Reset link sent to {user?.email}. Check your inbox (and spam).
          </Notice>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mt-5"
          disabled={busy}
          onClick={() => void emailResetLink()}
        >
          {busy ? "Sending…" : "Email me a reset link"}
        </Button>
      )}

      {error && (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </div>
  );
}

function ChangePassword() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);

    if (next.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("The two new passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 md:p-7">
      <h2 className="text-base">Change password</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field label="Current password" htmlFor="current" required>
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>

        <Field label="New password" htmlFor="next" required hint="At least 8 characters.">
          <Input
            id="next"
            type="password"
            autoComplete="new-password"
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirm" required>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        {error && <Notice tone="error">{error}</Notice>}
        {done && <Notice tone="success">Password updated.</Notice>}

        <Button type="submit" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}

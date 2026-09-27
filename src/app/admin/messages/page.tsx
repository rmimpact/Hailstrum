"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Notice } from "@/components/form";
import { Badge, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { describeAuthError } from "@/lib/firebase";
import {
  deleteMessage,
  listMessages,
  markMessageRead,
  type ContactMessage,
} from "@/lib/messages";

export default function MessagesPage() {
  return (
    <AdminShell title="Messages">
      <Inbox />
    </AdminShell>
  );
}

function Inbox() {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    listMessages()
      .then((rows) => {
        if (cancelled) return;
        setMessages(rows);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error(err);
        setError(describeAuthError(err));
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  async function toggleRead(message: ContactMessage) {
    setBusyId(message.id);
    try {
      await markMessageRead(message.id, !message.read);
      setMessages(
        (prev) =>
          prev?.map((m) =>
            m.id === message.id ? { ...m, read: !message.read } : m
          ) ?? null
      );
    } catch (err) {
      console.error(err);
      setError(describeAuthError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;

    setBusyId(message.id);
    try {
      await deleteMessage(message.id);
      setMessages((prev) => prev?.filter((m) => m.id !== message.id) ?? null);
    } catch (err) {
      console.error(err);
      setError(describeAuthError(err));
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <Notice tone="error">{error}</Notice>;

  if (messages === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-surface p-12 text-center">
        <p className="font-display text-base font-semibold text-ink">
          No messages yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          Anything sent through the contact form on the site lands here.
        </p>
      </div>
    );
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      {unread > 0 && (
        <p className="mb-5 text-sm text-ink-muted">
          {unread} unread {unread === 1 ? "message" : "messages"}
        </p>
      )}

      <ul className="space-y-4">
        {messages.map((message) => (
          <li
            key={message.id}
            className={`rounded-card border bg-surface p-6 ${
              message.read ? "border-line" : "border-accent/40"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-semibold">{message.name}</h2>
                  {!message.read && <Badge>New</Badge>}
                  <Badge tone="neutral">{message.topic}</Badge>
                </div>

                <p className="mt-1.5 text-sm text-ink-muted">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(
                      "Re: your message to Hailstrum"
                    )}`}
                    className="text-accent-ink underline underline-offset-4"
                  >
                    {message.email}
                  </a>
                  {message.organisation && (
                    <>
                      <span className="mx-2 opacity-50">·</span>
                      {message.organisation}
                    </>
                  )}
                  <span className="mx-2 opacity-50">·</span>
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleString("en-AU", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "just now"}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === message.id}
                  onClick={() => void toggleRead(message)}
                >
                  {message.read ? "Mark unread" : "Mark read"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === message.id}
                  onClick={() => void remove(message)}
                  className="!text-red-600 hover:!bg-red-50 dark:!text-red-400 dark:hover:!bg-red-950/40"
                >
                  Delete
                </Button>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-[0.9375rem] leading-relaxed text-ink-body">
              {message.message}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

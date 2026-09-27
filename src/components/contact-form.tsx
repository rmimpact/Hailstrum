"use client";

import { useState, type FormEvent } from "react";

import { Field, Input, Notice, Select, Textarea } from "./form";
import { Button } from "./ui";
import { company } from "@/lib/content";
import { isFirebaseConfigured } from "@/lib/firebase";
import { sendMessage, TOPICS } from "@/lib/messages";

type Status = "idle" | "sending" | "sent" | "error";

/** Whatever route to the team is actually live right now. */
const fallbackContact = company.email
  ? `email us directly at ${company.email}`
  : `message us on Instagram at ${company.instagramHandle}`;

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState("");

  // Drop a field's error as soon as the person starts fixing it, rather than
  // leaving it up until the next submit.
  const clearError = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: real people never fill a hidden field.
    if (String(data.get("company_website") ?? "")) {
      setStatus("sent");
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Please tell us your name.";
    if (!email) next.email = "We need an email to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "That doesn't look like a valid email address.";
    if (message.length < 10)
      next.message = "A little more detail helps us reply properly.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!isFirebaseConfigured()) {
      setStatus("error");
      setFailure(
        `The contact form isn't connected yet — please ${fallbackContact}.`
      );
      return;
    }

    setStatus("sending");
    try {
      await sendMessage({
        name,
        email,
        organisation: String(data.get("organisation") ?? ""),
        topic: String(data.get("topic") ?? TOPICS[0]),
        message,
      });
      setStatus("sent");
      form.reset();
    } catch (error) {
      console.error("Contact form failed", error);
      setStatus("error");
      setFailure(`Couldn't send that — please ${fallbackContact}.`);
    }
  }

  if (status === "sent") {
    return (
      <Notice tone="success">
        <p className="font-semibold">Thanks — message received.</p>
        <p className="mt-1">
          We read everything and usually reply within a few days.
        </p>
      </Notice>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            name="name"
            onChange={() => clearError("name")}
            autoComplete="name"
            invalid={Boolean(errors.name)}
            placeholder="Jordan Reed"
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            onChange={() => clearError("email")}
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            placeholder="jordan@company.com.au"
          />
        </Field>
      </div>

      <Field label="Organisation" htmlFor="organisation">
        <Input
          id="organisation"
          name="organisation"
          autoComplete="organization"
          placeholder="Optional"
        />
      </Field>

      <Field label="What's this about?" htmlFor="topic">
        <Select id="topic" name="topic" defaultValue={TOPICS[0]}>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Message" htmlFor="message" required error={errors.message}>
        <Textarea
          id="message"
          name="message"
          rows={6}
          onChange={() => clearError("message")}
          invalid={Boolean(errors.message)}
          placeholder="Tell us a bit about what you're after."
        />
      </Field>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && <Notice tone="error">{failure}</Notice>}

      <div className="flex items-center gap-4 pt-1">
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
        <p className="text-xs text-ink-muted">
          We’ll only use this to reply.
        </p>
      </div>
    </form>
  );
}

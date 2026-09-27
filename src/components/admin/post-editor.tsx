"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Field, Input, Notice, Select, Textarea } from "@/components/form";
import { Button, ButtonLink } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { describeAuthError } from "@/lib/firebase";
import { renderMarkdown } from "@/lib/markdown";
import {
  createPost,
  isSlugTaken,
  slugify,
  updatePost,
  type Post,
  type PostDraft,
  type PostStatus,
} from "@/lib/posts";

const EMPTY: PostDraft = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  status: "draft",
};

export function PostEditor({ existing }: { existing?: Post }) {
  const { user } = useAuth();
  const router = useRouter();

  const [draft, setDraft] = useState<PostDraft>(() =>
    existing
      ? {
          title: existing.title,
          slug: existing.slug,
          excerpt: existing.excerpt,
          body: existing.body,
          coverImage: existing.coverImage,
          status: existing.status,
        }
      : EMPTY
  );

  // Once the slug has been typed by hand, stop deriving it from the title.
  const [slugLocked, setSlugLocked] = useState(Boolean(existing));
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const set = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  // Warn before losing an unsaved draft.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const effectiveSlug = useMemo(
    () => (slugLocked ? draft.slug : slugify(draft.title)),
    [slugLocked, draft.slug, draft.title]
  );

  const previewHtml = useMemo(
    () => (preview ? renderMarkdown(draft.body) : ""),
    [preview, draft.body]
  );

  async function save(status: PostStatus) {
    if (!user) return;
    setError("");

    const title = draft.title.trim();
    if (!title) {
      setError("Give the post a title before saving.");
      return;
    }

    const slug = slugify(effectiveSlug || title);
    if (!slug) {
      setError("That title doesn't produce a usable URL. Add some letters or numbers.");
      return;
    }

    const payload: PostDraft = {
      ...draft,
      title,
      slug,
      excerpt: draft.excerpt.trim(),
      coverImage: draft.coverImage.trim(),
      status,
    };

    setBusy(true);
    try {
      if (await isSlugTaken(slug, existing?.id)) {
        setError(
          `Another post already uses /news/${slug}. Change the URL slug to something unique.`
        );
        return;
      }

      if (existing) {
        await updatePost(existing.id, payload, existing);
      } else {
        await createPost(payload, {
          uid: user.uid,
          name: user.displayName,
        });
      }

      setDirty(false);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      {/* ------------------------------ main column ----------------------- */}
      <div className="space-y-6 rounded-card border border-line bg-surface p-6 md:p-8">
        <Field label="Title" htmlFor="title" required>
          <Input
            id="title"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Stork Mk II took its first hover"
            className="!text-lg"
          />
        </Field>

        <Field
          label="Excerpt"
          htmlFor="excerpt"
          hint="One or two sentences, shown on the news list. Optional — we'll use the opening of the post if you leave it blank."
        >
          <Textarea
            id="excerpt"
            rows={2}
            value={draft.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </Field>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="body"
              className="block text-sm font-medium text-ink"
            >
              Body
              <span className="ml-1 text-accent-ink" aria-hidden="true">
                *
              </span>
            </label>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>

          <p className="mt-1 text-xs text-ink-muted">
            Markdown: <code className="font-mono">**bold**</code>,{" "}
            <code className="font-mono">*italic*</code>,{" "}
            <code className="font-mono"># Heading</code>,{" "}
            <code className="font-mono">- list</code>,{" "}
            <code className="font-mono">[link](url)</code>,{" "}
            <code className="font-mono">![image](url)</code>
          </p>

          <div className="mt-2">
            {preview ? (
              <div className="min-h-[24rem] rounded-lg border border-line bg-surface-2 p-5">
                {draft.body.trim() ? (
                  <div
                    className="post-body"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="text-sm text-ink-muted">
                    Nothing to preview yet.
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                id="body"
                rows={18}
                value={draft.body}
                onChange={(e) => set("body", e.target.value)}
                className="font-mono !text-sm"
                placeholder={"We flew the Mk II airframe for the first time this week.\n\n## What worked\n\n- The transition into wing-borne flight was clean\n- Battery draw matched the model within 4%\n\n## What didn't\n\nThe rear boom mount cracked on landing..."}
              />
            )}
          </div>
        </div>

        {error && <Notice tone="error">{error}</Notice>}
      </div>

      {/* ------------------------------- sidebar -------------------------- */}
      <aside className="space-y-6 lg:sticky lg:top-24">
        <div className="space-y-5 rounded-card border border-line bg-surface p-6">
          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              value={draft.status}
              onChange={(e) => set("status", e.target.value as PostStatus)}
            >
              <option value="draft">Draft — only visible here</option>
              <option value="published">Published — live on the site</option>
            </Select>
          </Field>

          <Field
            label="URL slug"
            htmlFor="slug"
            hint={`hailstrum.com/news/${effectiveSlug || "…"}`}
          >
            <Input
              id="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugLocked(true);
                set("slug", e.target.value);
              }}
              className="font-mono !text-sm"
            />
          </Field>

          <Field
            label="Cover image URL"
            htmlFor="cover"
            hint="Paste a link to an image. Optional."
          >
            <Input
              id="cover"
              type="url"
              value={draft.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://…"
              className="!text-sm"
            />
          </Field>

          {draft.coverImage && (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.coverImage}
                alt="Cover preview"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-card border border-line bg-surface p-6">
          <Button
            className="w-full"
            disabled={busy}
            onClick={() => void save("published")}
          >
            {busy ? "Saving…" : existing?.status === "published" ? "Update post" : "Publish"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => void save("draft")}
          >
            Save as draft
          </Button>

          <ButtonLink href="/admin" variant="ghost" className="w-full">
            Cancel
          </ButtonLink>
        </div>
      </aside>
    </div>
  );
}

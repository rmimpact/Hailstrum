"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ArrowRight, ButtonLink } from "./ui";
import { company } from "@/lib/content";
import { isFirebaseConfigured } from "@/lib/firebase";
import { renderMarkdown, plainTextExcerpt } from "@/lib/markdown";
import {
  formatPostDate,
  getPublishedPostBySlug,
  readingTimeMinutes,
  type Post,
} from "@/lib/posts";

type State =
  | { status: "loading" }
  | { status: "found"; post: Post }
  | { status: "missing" }
  | { status: "error" };

export function PostView() {
  const pathname = usePathname();
  const slug = decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");

  // "_post" is the placeholder page Firebase Hosting rewrites onto; landing on
  // it directly means no real slug was asked for. Derived rather than pushed
  // into state by an effect.
  const resolvable =
    Boolean(slug) && slug !== "_post" && isFirebaseConfigured();

  const [fetched, setFetched] = useState<State>({ status: "loading" });
  const state: State = useMemo(
    () => (resolvable ? fetched : { status: "missing" }),
    [resolvable, fetched]
  );

  useEffect(() => {
    if (!resolvable) return;
    let cancelled = false;

    getPublishedPostBySlug(slug)
      .then((post) => {
        if (cancelled) return;
        setFetched(post ? { status: "found", post } : { status: "missing" });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load post", error);
        setFetched({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, resolvable]);

  // The page is statically exported, so the document title and description are
  // set here once the post is known.
  useEffect(() => {
    if (state.status !== "found") return;

    const previous = document.title;
    document.title = `${state.post.title} — ${company.name}`;

    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      state.post.excerpt || plainTextExcerpt(state.post.body, 160)
    );

    return () => {
      document.title = previous;
      if (previousDescription !== null) {
        meta?.setAttribute("content", previousDescription);
      }
    };
  }, [state]);

  if (state.status === "loading") return <LoadingSkeleton />;
  if (state.status === "error") {
    return (
      <Message
        title="Couldn't load this update"
        body="Something went wrong fetching the post. Try refreshing the page."
      />
    );
  }
  if (state.status === "missing") {
    return (
      <Message
        title="Update not found"
        body="This post may have been removed, or the link might be wrong."
      />
    );
  }

  const { post } = state;

  return (
    <article className="py-14 md:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 font-display text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span> All updates
          </Link>

          <p className="mt-8 font-display text-xs uppercase tracking-[0.12em] text-ink-muted">
            <time dateTime={new Date(post.publishedAt ?? 0).toISOString()}>
              {formatPostDate(post.publishedAt)}
            </time>
            <span className="mx-2 opacity-50">·</span>
            {readingTimeMinutes(post.body)} min read
            {post.authorName && (
              <>
                <span className="mx-2 opacity-50">·</span>
                {post.authorName}
              </>
            )}
          </p>

          <h1 className="mt-4 text-[2rem] leading-[1.12] tracking-[-0.03em] md:text-[2.75rem]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-ink-body">
              {post.excerpt}
            </p>
          )}
        </div>

        {post.coverImage && (
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-card border border-line bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              className="h-auto w-full object-cover"
              decoding="async"
            />
          </div>
        )}

        <div
          className="post-body mx-auto mt-10 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
        />

        <div className="mx-auto mt-14 max-w-2xl border-t border-line pt-10">
          <p className="text-sm text-ink-muted">
            More from the team on{" "}
            <a
              href={company.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline underline-offset-4"
            >
              {company.instagramHandle}
            </a>
            .
          </p>
          <ButtonLink href="/news" variant="outline" className="mt-6">
            Read more updates
            <ArrowRight />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="py-14 md:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
          <div className="h-10 w-full animate-pulse rounded bg-surface-2" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
    </div>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-24">
      <div className="container-page">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl">{title}</h1>
          <p className="mt-3 text-ink-body">{body}</p>
          <ButtonLink href="/news" className="mt-8">
            Back to updates
            <ArrowRight />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

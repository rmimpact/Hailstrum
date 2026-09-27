import Link from "next/link";

import { formatPostDate, readingTimeMinutes, type Post } from "@/lib/posts";
import { plainTextExcerpt } from "@/lib/markdown";

export function PostCard({ post }: { post: Post }) {
  const summary = post.excerpt || plainTextExcerpt(post.body, 150);

  return (
    <article className="group h-full">
      <Link
        href={`/news/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
      >
        {post.coverImage ? (
          <div className="aspect-[16/9] overflow-hidden bg-surface-2">
            {/* Covers are arbitrary remote URLs pasted in the editor, so a plain
                <img> avoids next/image's host allowlist. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="aspect-[16/9] bg-surface-2"
            style={{
              backgroundImage:
                "radial-gradient(28rem 14rem at 70% 0%, var(--accent-soft), transparent 70%)",
            }}
          />
        )}

        <div className="flex flex-1 flex-col p-6">
          <p className="font-display text-xs uppercase tracking-[0.1em] text-ink-muted">
            <time dateTime={new Date(post.publishedAt ?? 0).toISOString()}>
              {formatPostDate(post.publishedAt)}
            </time>
            <span className="mx-2 opacity-50">·</span>
            {readingTimeMinutes(post.body)} min read
          </p>

          <h3 className="mt-3 text-lg leading-snug transition-colors group-hover:text-accent-ink">
            {post.title}
          </h3>

          {summary && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-body">
              {summary}
            </p>
          )}

          <p className="mt-5 pt-1 font-display text-sm font-medium text-accent-ink">
            Read update →
          </p>
        </div>
      </Link>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-card border border-line bg-surface">
      <div className="aspect-[16/9] animate-pulse bg-surface-2" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

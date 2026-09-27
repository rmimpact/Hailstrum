"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Notice } from "@/components/form";
import { ArrowRight, Badge, Button, ButtonLink } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { describeAuthError } from "@/lib/firebase";
import {
  deletePost,
  formatPostDate,
  listAllPosts,
  type Post,
} from "@/lib/posts";

export default function AdminPostsPage() {
  return (
    <AdminShell
      title="Posts"
      action={
        <ButtonLink href="/admin/posts/new" size="sm">
          New post
          <ArrowRight />
        </ButtonLink>
      }
    >
      <PostList />
    </AdminShell>
  );
}

function PostList() {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    listAllPosts()
      .then((rows) => {
        if (cancelled) return;
        setPosts(rows);
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
  }, [isAdmin, reloadKey]);

  async function handleDelete(post: Post) {
    const ok = window.confirm(
      `Delete "${post.title}"? This can't be undone.`
    );
    if (!ok) return;

    setDeleting(post.id);
    try {
      await deletePost(post.id);
      setReloadKey((key) => key + 1);
    } catch (err) {
      console.error(err);
      setError(describeAuthError(err));
    } finally {
      setDeleting(null);
    }
  }

  if (error) return <Notice tone="error">{error}</Notice>;

  if (posts === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-surface p-12 text-center">
        <p className="font-display text-base font-semibold text-ink">
          No posts yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
          Write your first update — a test flight, a print that failed, a
          milestone. It’ll appear on the News page as soon as you publish.
        </p>
        <ButtonLink href="/admin/posts/new" className="mt-7">
          Write the first post
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li
          key={post.id}
          className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-card border border-line bg-surface p-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-base font-semibold">{post.title}</h2>
              <Badge tone={post.status === "published" ? "accent" : "muted"}>
                {post.status === "published" ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs text-ink-muted">
              {post.status === "published"
                ? formatPostDate(post.publishedAt)
                : `Last edited ${formatPostDate(post.updatedAt)}`}
              <span className="mx-2 opacity-50">·</span>
              /news/{post.slug}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {post.status === "published" && (
              <Link
                href={`/news/${post.slug}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-body hover:bg-surface-2 hover:text-ink"
              >
                View
              </Link>
            )}
            <ButtonLink
              href={`/admin/posts/edit?id=${post.id}`}
              size="sm"
              variant="outline"
            >
              Edit
            </ButtonLink>
            <Button
              size="sm"
              variant="ghost"
              disabled={deleting === post.id}
              onClick={() => void handleDelete(post)}
              className="!text-red-600 hover:!bg-red-50 dark:!text-red-400 dark:hover:!bg-red-950/40"
            >
              {deleting === post.id ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

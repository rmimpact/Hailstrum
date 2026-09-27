"use client";

import { useEffect, useState } from "react";

import { PostCard, PostCardSkeleton } from "./post-card";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useInView } from "@/lib/use-in-view";
import { listPublishedPosts, type Post } from "@/lib/posts";

type State =
  | { status: "loading" }
  | { status: "ready"; posts: Post[] }
  | { status: "error"; message: string };

/**
 * Published posts, read straight from Firestore in the browser.
 *
 * The site is statically exported, so there's no build step to re-run when the
 * team publishes — a new post appears on the next page load.
 */
export function LatestPosts({ limit }: { limit?: number }) {
  // Whether Firebase is configured is fixed at build time, so the "nothing to
  // show" case is the initial state rather than something an effect sets.
  const [state, setState] = useState<State>(() =>
    isFirebaseConfigured()
      ? { status: "loading" }
      : { status: "ready", posts: [] }
  );

  // Loading posts pulls in the Firebase SDK, so hold off until the list is
  // close to the viewport. On /news that is immediately; on the home page,
  // where this sits near the bottom, it keeps the initial load lean.
  const { ref, inView } = useInView<HTMLDivElement>(400);

  useEffect(() => {
    if (!inView || !isFirebaseConfigured()) return;
    let cancelled = false;

    listPublishedPosts(limit ?? 50)
      .then((posts) => {
        if (!cancelled) setState({ status: "ready", posts });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load posts", error);
        setState({
          status: "error",
          message: "Couldn't load updates right now. Please try again later.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [limit, inView]);

  return (
    <div ref={ref}>
      {state.status === "loading" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit ?? 3 }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : state.status === "error" ? (
        <p className="rounded-card border border-line bg-surface p-6 text-sm text-ink-body">
          {state.message}
        </p>
      ) : state.posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface p-10 text-center">
      <p className="font-display text-base font-semibold text-ink">
        No updates published yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Build notes, test flights and milestones will show up here as the team
        posts them.
      </p>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { Notice } from "@/components/form";
import { ButtonLink } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { describeAuthError } from "@/lib/firebase";
import { getPostById, type Post } from "@/lib/posts";

export default function EditPostPage() {
  return (
    <AdminShell title="Edit post">
      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense fallback={<Loading />}>
        <EditLoader />
      </Suspense>
    </AdminShell>
  );
}

function EditLoader() {
  const params = useSearchParams();
  const id = params.get("id");
  const { isAdmin } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loadError, setLoadError] = useState("");

  // A missing ?id= is knowable at render, so it doesn't need an effect.
  const error = id ? loadError : "No post was specified.";

  useEffect(() => {
    if (!isAdmin || !id) return;

    let cancelled = false;
    getPostById(id)
      .then((found) => {
        if (cancelled) return;
        if (found) setPost(found);
        else setLoadError("That post no longer exists.");
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cancelled) setLoadError(describeAuthError(err));
      });

    return () => {
      cancelled = true;
    };
  }, [id, isAdmin]);

  if (error) {
    return (
      <div className="max-w-md">
        <Notice tone="error">{error}</Notice>
        <ButtonLink href="/admin" variant="outline" className="mt-5">
          Back to posts
        </ButtonLink>
      </div>
    );
  }

  if (!post) return <Loading />;

  return <PostEditor existing={post} />;
}

function Loading() {
  return (
    <div className="h-96 animate-pulse rounded-card border border-line bg-surface" />
  );
}

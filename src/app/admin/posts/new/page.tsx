"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";

export default function NewPostPage() {
  return (
    <AdminShell title="New post">
      <PostEditor />
    </AdminShell>
  );
}

/**
 * Reading and writing the `posts` collection in Firestore.
 *
 * Reads of published posts are public (see firestore.rules); every write
 * requires a signed-in account listed in the `admins` collection.
 */
import { getDb } from "./firebase";

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  status: PostStatus;
  authorName: string;
  authorUid: string;
  /** Milliseconds since epoch, or null while the post is still a draft. */
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type PostDraft = Pick<
  Post,
  "title" | "slug" | "excerpt" | "body" | "coverImage" | "status"
>;

const COLLECTION = "posts";

/** "Stork Mk II first flight!" -> "stork-mk-ii-first-flight" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatPostDate(ms: number | null): string {
  if (!ms) return "Draft";
  return new Date(ms).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */

type FirestoreLike = {
  data: () => Record<string, unknown>;
  id: string;
};

function toMillis(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return null;
}

function toPost(doc: FirestoreLike): Post {
  const d = doc.data();
  return {
    id: doc.id,
    title: String(d.title ?? "Untitled"),
    slug: String(d.slug ?? doc.id),
    excerpt: String(d.excerpt ?? ""),
    body: String(d.body ?? ""),
    coverImage: String(d.coverImage ?? ""),
    status: d.status === "published" ? "published" : "draft",
    authorName: String(d.authorName ?? "Hailstrum"),
    authorUid: String(d.authorUid ?? ""),
    publishedAt: toMillis(d.publishedAt),
    createdAt: toMillis(d.createdAt) ?? 0,
    updatedAt: toMillis(d.updatedAt) ?? 0,
  };
}

/* ------------------------------- public reads ------------------------------ */

export async function listPublishedPosts(max = 50): Promise<Post[]> {
  const db = await getDb();
  const { collection, query, where, orderBy, limit, getDocs } = await import(
    "firebase/firestore"
  );

  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(max)
    )
  );

  return snap.docs.map(toPost);
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<Post | null> {
  const db = await getDb();
  const { collection, query, where, limit, getDocs } = await import(
    "firebase/firestore"
  );

  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    )
  );

  return snap.empty ? null : toPost(snap.docs[0]);
}

/* ------------------------------- admin access ------------------------------ */

export async function listAllPosts(): Promise<Post[]> {
  const db = await getDb();
  const { collection, query, orderBy, getDocs } = await import(
    "firebase/firestore"
  );

  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("updatedAt", "desc"))
  );
  return snap.docs.map(toPost);
}

export async function getPostById(id: string): Promise<Post | null> {
  const db = await getDb();
  const { doc, getDoc } = await import("firebase/firestore");

  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? toPost({ id: snap.id, data: () => snap.data()! }) : null;
}

/** Rejects a slug that another post already uses, so URLs stay unique. */
export async function isSlugTaken(
  slug: string,
  exceptId?: string
): Promise<boolean> {
  const db = await getDb();
  const { collection, query, where, limit, getDocs } = await import(
    "firebase/firestore"
  );

  const snap = await getDocs(
    query(collection(db, COLLECTION), where("slug", "==", slug), limit(2))
  );
  return snap.docs.some((d) => d.id !== exceptId);
}

export async function createPost(
  draft: PostDraft,
  author: { uid: string; name: string }
): Promise<string> {
  const db = await getDb();
  const { collection, addDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );

  const ref = await addDoc(collection(db, COLLECTION), {
    ...draft,
    authorUid: author.uid,
    authorName: author.name,
    publishedAt: draft.status === "published" ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updatePost(
  id: string,
  draft: PostDraft,
  existing: Post
): Promise<void> {
  const db = await getDb();
  const { doc, updateDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );

  // Keep the original publish date when re-editing an already-published post;
  // stamp a fresh one the first time it goes live.
  const publishedAt =
    draft.status === "published"
      ? existing.publishedAt ?? serverTimestamp()
      : null;

  await updateDoc(doc(db, COLLECTION, id), {
    ...draft,
    publishedAt,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDb();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, COLLECTION, id));
}

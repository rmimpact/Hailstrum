/**
 * Contact form submissions.
 *
 * Anyone may create a message (that's the point of a contact form); only signed
 * in admins can read or delete them. Enforced in firestore.rules.
 */
import { getDb } from "./firebase";

export const TOPICS = [
  "Partnership or pilot",
  "Investment",
  "Press",
  "Joining the team",
  "Something else",
] as const;

export type Topic = (typeof TOPICS)[number];

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organisation: string;
  topic: string;
  message: string;
  createdAt: number;
  read: boolean;
}

const COLLECTION = "messages";

export async function sendMessage(input: {
  name: string;
  email: string;
  organisation: string;
  topic: string;
  message: string;
}): Promise<void> {
  const db = await getDb();
  const { collection, addDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );

  await addDoc(collection(db, COLLECTION), {
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 200),
    organisation: input.organisation.trim().slice(0, 160),
    topic: input.topic.slice(0, 80),
    message: input.message.trim().slice(0, 4000),
    createdAt: serverTimestamp(),
    read: false,
  });
}

export async function listMessages(): Promise<ContactMessage[]> {
  const db = await getDb();
  const { collection, query, orderBy, getDocs } = await import(
    "firebase/firestore"
  );

  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
  );

  return snap.docs.map((doc) => {
    const d = doc.data();
    const created = d.createdAt as { toMillis?: () => number } | null;
    return {
      id: doc.id,
      name: String(d.name ?? ""),
      email: String(d.email ?? ""),
      organisation: String(d.organisation ?? ""),
      topic: String(d.topic ?? ""),
      message: String(d.message ?? ""),
      createdAt: created?.toMillis?.() ?? 0,
      read: Boolean(d.read),
    };
  });
}

export async function markMessageRead(
  id: string,
  read: boolean
): Promise<void> {
  const db = await getDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, COLLECTION, id), { read });
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDb();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, COLLECTION, id));
}

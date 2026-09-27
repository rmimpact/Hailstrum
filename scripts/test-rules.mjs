/**
 * Exercises firestore.rules against the local emulators.
 *
 * The site is a static export: the admin UI is only a convenience, and anyone
 * can call Firestore directly from a console. These rules are the actual
 * security boundary, so they get tested.
 *
 *   npm run emulate     # terminal 1
 *   npm run seed        # terminal 2 — creates the admin account
 *   npm run test:rules  # terminal 2
 */
import { initializeApp, deleteApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const PROJECT = process.env.FIREBASE_PROJECT_ID ?? "demo-hailstrum";
const EMAIL = process.env.SEED_EMAIL ?? "founder@hailstrum.com";
const PASSWORD = process.env.SEED_PASSWORD ?? "hailstrum123";

const app = initializeApp({
  apiKey: "demo-api-key",
  projectId: PROJECT,
  appId: "1:0:web:0",
});
const db = getFirestore(app);
const auth = getAuth(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

let passed = 0;
let failed = 0;

function record(ok, label, detail = "") {
  if (ok) {
    passed++;
    console.log(`  \u001b[32m✓\u001b[0m ${label}`);
  } else {
    failed++;
    console.log(`  \u001b[31m✗\u001b[0m ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Asserts the operation is rejected by the rules. */
async function denied(label, fn) {
  try {
    await fn();
    record(false, label, "it was ALLOWED but should have been denied");
  } catch (error) {
    const code = error?.code ?? "";
    record(
      code === "permission-denied",
      label,
      code === "permission-denied" ? "" : `unexpected error: ${code || error?.message}`
    );
  }
}

/** Asserts the operation succeeds. */
async function allowed(label, fn) {
  try {
    await fn();
    record(true, label);
  } catch (error) {
    record(false, label, `denied unexpectedly: ${error?.code ?? error?.message}`);
  }
}

const validMessage = (overrides = {}) => ({
  name: "Rules Test",
  email: "rules@example.com",
  organisation: "",
  topic: "Something else",
  message: "This message is long enough to satisfy the minimum length rule.",
  createdAt: serverTimestamp(),
  read: false,
  ...overrides,
});

async function main() {
  console.log("\nFirestore rules — signed out\n");

  await allowed("published posts are publicly readable", () =>
    getDocs(
      query(
        collection(db, "posts"),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc"),
        limit(5)
      )
    )
  );

  await denied("cannot list posts without the published filter (drafts leak)", () =>
    getDocs(query(collection(db, "posts"), limit(20)))
  );

  await denied("cannot list drafts directly", () =>
    getDocs(
      query(collection(db, "posts"), where("status", "==", "draft"), limit(5))
    )
  );

  await denied("cannot create a post", () =>
    addDoc(collection(db, "posts"), {
      title: "Injected",
      slug: "injected",
      status: "published",
      body: "",
      excerpt: "",
      coverImage: "",
      authorName: "x",
      authorUid: "x",
      publishedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );

  await allowed("anyone can send a well-formed contact message", () =>
    addDoc(collection(db, "messages"), validMessage())
  );

  await denied("cannot send a message pre-marked as read", () =>
    addDoc(collection(db, "messages"), validMessage({ read: true }))
  );

  await denied("cannot send a message with an unexpected field", () =>
    addDoc(collection(db, "messages"), validMessage({ isAdmin: true }))
  );

  await denied("cannot send a message that is too short", () =>
    addDoc(collection(db, "messages"), validMessage({ message: "hi" }))
  );

  await denied("cannot send a message with a 10k-character body", () =>
    addDoc(collection(db, "messages"), validMessage({ message: "x".repeat(10_000) }))
  );

  await denied("cannot read the inbox", () =>
    getDocs(query(collection(db, "messages"), limit(5)))
  );

  await denied("cannot grant itself admin", () =>
    setDoc(doc(db, "admins", "attacker"), { email: "attacker@example.com" })
  );

  await denied("cannot enumerate the admin roster", () =>
    getDocs(query(collection(db, "admins"), limit(10)))
  );

  console.log("\nFirestore rules — signed in as an admin\n");
  const credential = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
  const uid = credential.user.uid;

  await allowed("admin can read its own roster entry", () =>
    getDoc(doc(db, "admins", uid))
  );

  await allowed("admin can list all posts including drafts", () =>
    getDocs(query(collection(db, "posts"), orderBy("updatedAt", "desc")))
  );

  await allowed("admin can read the inbox", () =>
    getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc")))
  );

  let createdId = null;
  await allowed("admin can create a post", async () => {
    const ref = await addDoc(collection(db, "posts"), {
      title: "Rules test post",
      slug: `rules-test-${Date.now()}`,
      excerpt: "",
      body: "",
      coverImage: "",
      status: "draft",
      authorName: "Rules test",
      authorUid: uid,
      publishedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    createdId = ref.id;
  });

  if (createdId) {
    await allowed("admin can delete a post", () =>
      deleteDoc(doc(db, "posts", createdId))
    );
  }

  await denied("even an admin cannot edit the roster from the browser", () =>
    setDoc(doc(db, "admins", uid), { email: EMAIL, escalated: true })
  );

  await signOut(auth);

  console.log(
    `\n${failed === 0 ? "\u001b[32mAll" : "\u001b[31m"} ${passed} passed, ${failed} failed\u001b[0m\n`
  );
  await deleteApp(app);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error("\nRules test crashed:", error?.message ?? error);
  console.error("Are the emulators running?  npm run emulate\n");
  process.exit(1);
});

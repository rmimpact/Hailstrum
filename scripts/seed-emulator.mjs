/**
 * Seeds the local Firebase emulators with an admin account and a sample post,
 * so the admin area can be exercised without touching the real project.
 *
 *   npm run emulate      # terminal 1 — starts the emulators
 *   npm run seed         # terminal 2 — runs this
 *
 * Never point this at a real project: it talks to 127.0.0.1 only, and the
 * emulator accepts the magic "owner" token that bypasses security rules.
 */
const PROJECT = process.env.FIREBASE_PROJECT_ID ?? "demo-hailstrum";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key";

const AUTH = `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1`;
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;

const EMAIL = process.env.SEED_EMAIL ?? "founder@hailstrum.com";
const PASSWORD = process.env.SEED_PASSWORD ?? "hailstrum123";

async function ensureEmulators() {
  try {
    await fetch("http://127.0.0.1:4400/emulators", { signal: AbortSignal.timeout(2500) });
  } catch {
    console.error(
      "\n  The Firebase emulators aren't running.\n  Start them first:  npm run emulate\n"
    );
    process.exit(1);
  }
}

async function createUser() {
  let res = await fetch(`${AUTH}/accounts:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body?.error?.message === "EMAIL_EXISTS") {
      res = await fetch(`${AUTH}/accounts:signInWithPassword?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
      });
      if (!res.ok) throw new Error(`Sign-in failed: ${await res.text()}`);
      console.log(`  · admin account already existed`);
    } else {
      throw new Error(`Sign-up failed: ${JSON.stringify(body)}`);
    }
  } else {
    console.log(`  · created admin account`);
  }

  const { localId } = await res.json();
  return localId;
}

/** Writes a document as the emulator owner, bypassing security rules. */
async function write(path, fields, documentId) {
  const url = documentId
    ? `${FS}/${path}?documentId=${encodeURIComponent(documentId)}`
    : `${FS}/${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer owner",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok && res.status !== 409) {
    throw new Error(`Write to ${path} failed: ${await res.text()}`);
  }
  return res.status === 409 ? null : res.json();
}

const str = (stringValue) => ({ stringValue });
const ts = (date) => ({ timestampValue: date.toISOString() });

async function main() {
  await ensureEmulators();
  console.log(`\nSeeding emulators for project "${PROJECT}"…\n`);

  const uid = await createUser();
  await write("admins", { email: str(EMAIL), addedAt: ts(new Date()) }, uid);
  console.log(`  · granted admin to ${uid}`);

  const now = new Date();
  await write("posts", {
    title: str("Stork Mk II held a stable hover for the first time"),
    slug: str("stork-mk-ii-first-hover"),
    excerpt: str(
      "Six seconds of clean hover on the new airframe, and a cracked boom mount on landing. Both were useful."
    ),
    body: str(
      [
        "We flew the Mk II airframe for the first time on Tuesday night in the ProtoSpace car park.",
        "",
        "## What worked",
        "",
        "- The transition into wing-borne flight was cleaner than the Mk I, which used to porpoise badly",
        "- Battery draw tracked the model within **4%**, which is the closest we've been",
        "- The new propellers were noticeably quieter at hover RPM",
        "",
        "## What didn't",
        "",
        "The rear boom mount cracked on landing. It's a printed PLA part that we knew was marginal — it was always going to be the first thing to fail, we just wanted to know *how*.",
        "",
        "> Testing and refining is not a phase we pass through. It's the whole job.",
        "",
        "Next up: reprint the mounts in something tougher and get back out there.",
      ].join("\n")
    ),
    coverImage: str(""),
    status: str("published"),
    authorName: str("Hailstrum"),
    authorUid: str(uid),
    publishedAt: ts(now),
    createdAt: ts(now),
    updatedAt: ts(now),
  });

  const older = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12);
  await write("posts", {
    title: str("Why we started with the propeller"),
    slug: str("why-we-started-with-the-propeller"),
    excerpt: str(
      "Adding battery adds mass, and mass costs range. The returns stop quickly. Here's the arithmetic that set our roadmap."
    ),
    body: str(
      [
        "Every conversation about drone range starts in the same place: *just add more battery*.",
        "",
        "It doesn't work, and the reason is arithmetic. Extra cells add mass, mass needs more lift, more lift needs more power, and the extra power eats most of the energy the extra cells brought. Past a certain point you're carrying battery to carry battery.",
        "",
        "So we went the other way and asked where the energy already on board is being wasted. The answer, for most small aircraft, is propulsion.",
        "",
        "That's why programme 01 is a propeller and not an airframe.",
      ].join("\n")
    ),
    coverImage: str(""),
    status: str("published"),
    authorName: str("Hailstrum"),
    authorUid: str(uid),
    publishedAt: ts(older),
    createdAt: ts(older),
    updatedAt: ts(older),
  });

  await write("posts", {
    title: str("Thrust rig v2 — work in progress"),
    slug: str("thrust-rig-v2"),
    excerpt: str("Draft notes on the load cell mount."),
    body: str("Still writing this one up."),
    coverImage: str(""),
    status: str("draft"),
    authorName: str("Hailstrum"),
    authorUid: str(uid),
    publishedAt: { nullValue: null },
    createdAt: ts(now),
    updatedAt: ts(now),
  });
  console.log("  · added 2 published posts and 1 draft");

  await write("messages", {
    name: str("Dana Whitfield"),
    email: str("dana@northlinefreight.com.au"),
    organisation: str("Northline Freight"),
    topic: str("Partnership or pilot"),
    message: str(
      "We run regional routes out of Dubbo and the last leg is killing our margins. Would be keen to talk about a pilot when you're ready for one."
    ),
    createdAt: ts(now),
    read: { booleanValue: false },
  });
  console.log("  · added 1 contact message");

  console.log(`\nDone. Sign in at http://localhost:3000/admin/login\n`);
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}\n`);
}

main().catch((error) => {
  console.error("\nSeeding failed:", error.message, "\n");
  process.exit(1);
});

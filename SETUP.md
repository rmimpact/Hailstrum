# Setting up the Hailstrum site

Everything the site needs — hosting, login, the database — comes from one free
Firebase project. No credit card, no second service.

Work through this once. It takes about 20 minutes.

---

## 0. Before you start

You need **Node.js 20 or newer**. Check with `node --version`.

Then install the project's dependencies:

```bash
npm install
```

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
   Use one the whole team can get into — not a personal account someone might
   lose access to.
2. Click **Create a project**.
3. Name it something like `hailstrum-site`.
4. Google Analytics is optional. You can turn it off.

---

## 2. Turn on Email/Password sign-in

1. In the left sidebar: **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab.
3. Click **Email/Password**, toggle **Enable**, and **Save**.
   Leave "Email link (passwordless sign-in)" off.

This is also what sends password-reset emails. There is nothing else to set up
for those — Firebase sends them for free.

---

## 3. Create the database

1. Left sidebar: **Build → Firestore Database → Create database**.
2. Choose **Start in production mode**. (The real rules get deployed in step 6;
   production mode just means it starts locked down rather than wide open.)
3. Pick a location close to Sydney — **`australia-southeast1`** is the right one.
   **This cannot be changed later.**

---

## 4. Get your web config

1. Click the **gear icon → Project settings**.
2. Scroll to **Your apps** and click the web icon (`</>`).
3. Give it a nickname (`hailstrum-web`). You do *not* need Firebase Hosting
   checked here — we set that up from the command line.
4. Firebase shows you a `firebaseConfig` block. Keep that tab open.

Now, in the project folder:

```bash
cp .env.example .env.local
```

Open `.env.local` and copy each value across:

| `firebaseConfig` key | `.env.local` variable |
| --- | --- |
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

> **These values are not secrets.** Every website that talks to Firebase ships
> them in its JavaScript. What keeps your data safe is `firestore.rules`, which
> runs on Google's servers. Don't panic about them being visible.

---

## 5. Point the project at Firebase

```bash
npx firebase login
npx firebase use --add
```

Pick the project you just made and give it the alias `default`.

---

## 6. Deploy the security rules

**Do this before anything else goes live.** These rules are what stop strangers
writing posts.

```bash
npm run deploy:rules
```

The database indexes deploy at the same time. They take a minute or two to
build; the news page will throw an error until they're ready.

---

## 7. Create the first admin account

Two short steps in the Firebase console.

**a) Create the login**

1. **Build → Authentication → Users → Add user**.
2. Enter the founder's email address and a temporary password.
3. Click **Add user**.
4. Copy the **User UID** from the list — a long string like
   `Q9M0rOxg5g0Sm4fsv8gmYsGGMk4R`.

**b) Grant them admin**

1. **Build → Firestore Database → Start collection**.
2. Collection ID: `admins` — exactly that, lowercase.
3. **Document ID: paste the User UID from step (a).** This is the part that
   matters; the rules look the account up by its UID.
4. Add one field so the document isn't empty:
   - Field `email`, type `string`, value: their email address.
5. **Save**.

That account can now sign in at `/admin` and publish.

To add another founder, repeat both steps. To remove someone's access, delete
their document from `admins` (and their account from Authentication).

> Admin access is deliberately *only* grantable from the console. Nothing in the
> website can hand out admin rights, even to someone already signed in — so a
> compromised account can't promote anyone.

---

## 8. Build and deploy

```bash
npm run deploy
```

That builds the site and pushes it to Firebase Hosting. When it finishes it
prints your live URL — something like `https://hailstrum-site.web.app`.

Open `/admin`, sign in with the account from step 7, and write a post.

---

## 9. Your custom domain

1. **Build → Hosting → Add custom domain**.
2. Type your domain (e.g. `hailstrum.com`).
3. Firebase gives you DNS records to add at your registrar.
4. Add them, then wait. The certificate is issued automatically and is free —
   usually under an hour, occasionally up to 24.

Once it's live, update `NEXT_PUBLIC_SITE_URL` in `.env.local` (and in your
GitHub repo variables, if you set up automatic deploys) to the real address so
link previews point at the right place.

---

## Day-to-day

### Running the site locally

```bash
npm run dev
```

Then <http://localhost:3000>. This talks to your **real** Firebase project, so
anything you publish is live immediately.

### Working without touching the real data

The Firebase emulators give you a throwaway copy of Auth and Firestore on your
own machine. Needs **Java 11 or newer** installed.

```bash
npm run emulate   # terminal 1 — leave running
npm run seed      # terminal 2 — creates a test admin and some posts
```

Then add this line to `.env.local`:

```
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

and restart `npm run dev`. The seed script prints the test login details.

**Remove that line before you deploy** — leaving it in would ship a site that
tries to talk to a database on the visitor's own computer.

### Checking the security rules still hold

```bash
npm run test:rules
```

Run this any time you edit `firestore.rules`. It checks that drafts stay
private, strangers can't publish, the contact inbox stays locked, and nobody can
grant themselves admin.

---

## If something goes wrong

**"Firebase isn't connected yet" on `/admin`**
`.env.local` is missing or empty. Redo step 4, then restart `npm run dev`.

**"This account isn't an admin"**
The sign-in worked but step 7(b) didn't. Check the document ID in `admins`
matches the User UID *exactly* — no spaces, no quotes.

**The news page shows "Couldn't load updates"**
Usually the indexes from step 6 are still building. Wait a couple of minutes.
Otherwise open the browser console: Firebase prints a link that creates the
missing index for you.

**A reset email never arrives**
Check spam. Confirm Email/Password is enabled (step 2). Firebase's free tier
has a daily cap, which is generous but not infinite.

**`npm run deploy` fails with a permissions error**
Run `npx firebase login --reauth`.

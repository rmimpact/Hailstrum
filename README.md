# Hailstrum

The website for [Hailstrum](https://www.instagram.com/hailstrum_robotics/) — a
UTS early-stage drone startup reducing shipping costs through reliable Guidance,
Navigation and Control systems in autonomous aircraft.

A marketing site plus a small admin area where the team signs in and publishes
updates, with no redeploy needed.

**New here? Start with [SETUP.md](SETUP.md).**

---

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, with the theme as CSS custom properties |
| Hosting | Firebase Hosting — the site builds to static HTML |
| Login | Firebase Auth (email + password, with built-in password reset) |
| Data | Cloud Firestore — posts and contact messages |

The whole site is statically exported, so every page is plain HTML served from
a CDN. Posts and messages are fetched in the browser, which means publishing is
instant and never needs a rebuild.

## Commands

```bash
npm run dev            # local dev server on :3000
npm run build          # static export into out/
npm run deploy         # build, then push to Firebase Hosting
npm run deploy:rules   # push firestore.rules and indexes only

npm run emulate        # local Auth + Firestore emulators (needs Java 11+)
npm run seed           # fill the emulators with a test admin and sample posts
npm run test:rules     # check the security rules actually deny what they should

npm run typecheck      # tsc --noEmit
npm run lint
```

## Layout

```
src/
  app/
    (site)/            public pages — the route group keeps the marketing
      page.tsx           chrome off the admin area
      technology/
      about/
      news/            list + [slug] (see "Post URLs" below)
      contact/
    admin/             sign-in, post editor, contact inbox, account
    layout.tsx         fonts, metadata, the no-flash theme script
    globals.css        design tokens for both themes

  components/          UI primitives, site chrome, the admin shell
  lib/
    content.ts         all site copy — edit here, not in components
    firebase.ts        lazily-loaded SDK bootstrap
    posts.ts           the posts collection
    messages.ts        the contact inbox
    auth-context.tsx   who is signed in, and whether they're an admin
    markdown.ts        the small Markdown subset post bodies are written in

firestore.rules        the actual security boundary — see below
firebase.json          hosting config, caching, the /news rewrite
scripts/               emulator seeding and the rules test suite
```

## Editing the site's words

Almost all copy lives in [`src/lib/content.ts`](src/lib/content.ts) — the
mission, the roadmap, team members, specs, the lot. Change it there and the
pages follow.

A few numbers in that file are marked `// CHECK`. They came from the pitch deck
or were estimated while building; confirm them before you send the site to
anyone who matters.

The propeller efficiency curve is a separate constant at the top of
[`src/components/efficiency-chart.tsx`](src/components/efficiency-chart.tsx).
Swap in your real CFD or thrust-rig numbers and the chart — peak marker,
labels, table view — updates itself.

## Theming

The site follows the visitor's device: dark mode on a dark-mode phone, light on
a light one. There's also a toggle in the header that cycles
light → dark → match device.

Both themes are defined as CSS variables in `globals.css`. Dark mode is a deep
navy rather than black, matching the logo. To change a colour, change the
variable — components reference tokens (`bg-surface`, `text-ink`), never raw
hex.

Chart colours are separate tokens (`--chart-series`): the logo green is too
desaturated to read as a data mark, so plots use a higher-chroma step of the
same hue. Both are contrast-checked against their backgrounds.

## Post URLs

Posts live in Firestore and are written after the site is built, so there's no
pre-rendered file for each one. `firebase.json` rewrites every `/news/<slug>`
request onto a single exported page, which reads the slug from the URL and
fetches that post.

The trade-off: post pages are rendered in the browser, so search engines index
them less eagerly than the static marketing pages. Worth revisiting if the blog
becomes a real traffic source — the fix is to fetch published slugs at build
time in `generateStaticParams`.

## Security

`firestore.rules` is the real boundary, not the admin UI. The site is static —
anyone can read its JavaScript and call Firestore directly — so every rule is
enforced on Google's servers:

- published posts are public; **drafts are not**
- only an account with a document in `admins` can write posts
- anyone can send a contact message, but its shape and size are constrained
- only admins can read the inbox
- **nothing in the website can grant admin**, so a compromised account can't
  promote anyone — admins are added from the Firebase console only

`npm run test:rules` checks all of that against the emulators. Run it whenever
you touch the rules.

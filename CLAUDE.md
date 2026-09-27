# Working in this repo

Hailstrum's website: Next.js 16 App Router, statically exported, on Firebase
Hosting. Auth and data come from Firebase (Auth + Firestore), called from the
browser. See [README.md](README.md) for the layout and [SETUP.md](SETUP.md) for
provisioning.

## Things that will bite you

- **The build is a static export.** `output: "export"` is set for production
  builds only — `next dev` runs without it, because with it on the dev server
  refuses any `/news/<slug>` not listed in `generateStaticParams`. Anything
  needing a server at request time (route handlers, middleware, ISR, image
  optimisation) will not work.
- **`firestore.rules` is the security boundary, not the admin UI.** The client
  bundle is public. Any change to what an admin may do has to be made in the
  rules, and `npm run test:rules` must still pass.
- **Admin rights are console-only by design.** Nothing in the app may write to
  the `admins` collection. Don't add a "manage users" screen that does.
- **Firebase is imported lazily** (`await import("firebase/...")` inside
  `src/lib/firebase.ts` and callers). That keeps the ~550 KB SDK off the
  marketing pages. Don't hoist those into top-level imports.
- **Don't gate content on `IntersectionObserver` alone.** Some webviews never
  fire the initial callback for an already-visible element, which leaves
  content permanently hidden. Use `useInView` from `src/lib/use-in-view.ts`,
  which measures geometry on mount first.

## Conventions

- Colours come from CSS custom properties in `globals.css`, surfaced as
  Tailwind tokens (`bg-surface`, `text-ink`, `border-line`). Don't write raw
  hex in components.
- On navy sections use `text-on-navy*` tokens — the light-theme accent doesn't
  have enough contrast against navy for small text.
- Site copy belongs in `src/lib/content.ts`, not inline in components.
- Charts follow the project's dataviz rules: solid hairline gridlines, 2 px
  lines, markers with a surface ring, direct-label the extreme only, and a
  table view alongside every chart.

## Before calling a change done

```bash
npm run typecheck && npm run lint && npm run build
```

If you touched `firestore.rules`, also run the emulators and `npm run test:rules`.

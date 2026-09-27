# Working in this repo

Hailstrum Robotics' website: Next.js 16 App Router, statically exported.
Deployed to GitHub Pages at https://rmimpact.github.io/Hailstrum/ by
`.github/workflows/pages.yml`; a Firebase Hosting workflow exists but is
manual-trigger only. Auth and data come from Firebase (Auth + Firestore),
called from the browser. See [README.md](README.md) for the layout and
[SETUP.md](SETUP.md) for provisioning.

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
- **GitHub Pages serves the site from `/Hailstrum`.** The workflow passes
  that as `NEXT_PUBLIC_BASE_PATH`. Next applies it to routes and its own
  metadata files, but *not* to `next/image` with `unoptimized` — reference
  anything in `public/` through `asset()` in `src/lib/asset.ts` or it will
  404 in production while working locally. Drop the base path when the custom
  domain goes live.
- **Don't gate content on `IntersectionObserver` alone.** Some webviews never
  fire the initial callback for an already-visible element, which leaves
  content permanently hidden. Use `useInView` from `src/lib/use-in-view.ts`,
  which measures geometry on mount first.

## Conventions

- **One dark theme, by choice.** Navy ground, white text, gold accent, taken
  from the logo. There is no light palette, no `prefers-color-scheme` block,
  no `data-theme` attribute and no toggle — `:root` carries the whole palette
  and sets `color-scheme: dark`. Don't reintroduce a second theme without
  being asked.
- Colours come from CSS custom properties in `globals.css`, surfaced as
  Tailwind tokens (`bg-surface`, `text-ink`, `border-line`, `text-accent`).
  Don't write raw hex in components.
- **Chart marks use `--chart-series`, not `--accent`.** The brand gold is too
  light to sit in the dark-mode lightness band as a data mark; the chart token
  is a deeper step of the same hue that clears the palette checks.
- Site copy belongs in `src/lib/content.ts`, not inline in components. A few
  figures there are marked `// CHECK` — estimated or deck-derived, and not yet
  confirmed by the team. Don't quietly promote one to fact.
- Charts follow the project's dataviz rules: solid hairline gridlines, 2 px
  lines, markers with a surface ring, direct-label the extreme only, and a
  table view alongside every chart.

## Before calling a change done

```bash
npm run typecheck && npm run lint && npm run build
```

If you touched `firestore.rules`, also run the emulators and `npm run test:rules`.

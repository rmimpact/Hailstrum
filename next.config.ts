import type { NextConfig } from "next";

// `output: "export"` is what makes the production build a folder of plain HTML
// for Firebase Hosting. It is deliberately NOT applied to `next dev`: with it
// on, the dev server refuses any /news/<slug> that isn't listed in
// generateStaticParams, so posts written in the admin area couldn't be
// previewed locally. In production those URLs are served by the Firebase
// Hosting rewrite in firebase.json.
const isProductionBuild = process.env.NODE_ENV === "production";

// Guard rail: NEXT_PUBLIC_* values are baked into the bundle at build time, so
// a production build made with the emulator flag still set would ship a site
// that tries to reach a database on the visitor's own machine. Fail loudly
// instead of deploying that.
if (
  isProductionBuild &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
) {
  throw new Error(
    "Refusing to build: NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true is set.\n" +
      "That flag points the app at http://127.0.0.1, which would break the " +
      "deployed site for everyone.\nRemove it from .env.local before building."
  );
}

// GitHub Pages serves a project site from /<repo>, so every link and asset
// needs that prefix. The Pages workflow supplies it; a custom domain (or
// Firebase Hosting) serves from the root, where this stays empty.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = rawBasePath === "/" ? "" : rawBasePath.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  ...(isProductionBuild ? { output: "export" as const } : {}),
  ...(basePath ? { basePath } : {}),

  // The export target has no Next.js image optimizer at runtime.
  images: { unoptimized: true },

  // Firebase Hosting is configured with cleanUrls, so /about serves about.html.
  trailingSlash: false,
};

export default nextConfig;

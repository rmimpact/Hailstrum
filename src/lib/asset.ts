/**
 * Prefixes a file in /public with the deployment's base path.
 *
 * Next.js applies `basePath` to routes and to its own metadata files, but
 * `next/image` with `unoptimized: true` passes `src` through untouched — so a
 * public asset referenced directly would 404 on a GitHub Pages project site,
 * which serves everything under /<repo>.
 */
const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const basePath = raw === "/" ? "" : raw.replace(/\/+$/, "");

export function asset(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

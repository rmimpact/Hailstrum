import { PostView } from "@/components/post-view";

/**
 * Posts live in Firestore and are created after the site is built, so there is
 * nothing to pre-render per slug. We export one placeholder page and Firebase
 * Hosting rewrites every /news/<slug> request onto it (see firebase.json); the
 * component then reads the slug from the URL and fetches that post.
 */
export function generateStaticParams() {
  return [{ slug: "_post" }];
}

export default function NewsPostPage() {
  return <PostView />;
}

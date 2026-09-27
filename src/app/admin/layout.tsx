import type { Metadata } from "next";

import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Admin",
  // The admin area must never show up in search results.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthProvider>
      <div id="main" className="flex min-h-dvh flex-col bg-bg-subtle">
        {children}
      </div>
    </AuthProvider>
  );
}

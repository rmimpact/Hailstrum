"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { Button, ButtonLink } from "@/components/ui";
import { Notice } from "@/components/form";
import { useAuth } from "@/lib/auth-context";

const ADMIN_NAV = [
  { href: "/admin", label: "Posts" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/account", label: "Account" },
];

/**
 * Wraps every signed-in admin page: handles the auth gate, then renders the
 * admin chrome around its children.
 *
 * This gate is a convenience, not the security boundary — the site is a static
 * export, so anyone can load this JavaScript. What actually protects the data is
 * firestore.rules, which checks `admins/{uid}` on every read and write.
 */
export function AdminShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { user, isAdmin, loading, configured, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/admin/login");
    }
  }, [loading, configured, user, router]);

  if (!configured) return <SetupRequired />;
  if (loading) return <Loading />;
  if (!user) return <Loading />; // redirecting

  if (!isAdmin) {
    return (
      <CenteredCard>
        <Notice tone="error">
          <p className="font-semibold">This account isn’t an admin.</p>
          <p className="mt-1">
            You’re signed in as {user.email}, but that account hasn’t been given
            access yet. Whoever set the site up needs to add a document with the
            ID <code className="font-mono">{user.uid}</code> to the{" "}
            <code className="font-mono">admins</code> collection in Firestore.
          </p>
        </Notice>
        <Button variant="outline" className="mt-6" onClick={() => void signOut()}>
          Sign out
        </Button>
      </CenteredCard>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-lg">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="rounded-md" aria-label="Hailstrum, home">
                <Logo />
              </Link>
              <span
                aria-hidden="true"
                className="hidden h-5 w-px bg-line sm:block"
              />
              <nav aria-label="Admin" className="hidden items-center gap-1 sm:flex">
                {ADMIN_NAV.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin" || pathname.startsWith("/admin/posts")
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-accent-soft text-accent-ink"
                          : "text-ink-body hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-ink-muted md:inline">
                {user.email}
              </span>
              <ThemeToggle />
              <Button size="sm" variant="outline" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          </div>

          {/* Small screens get the nav on its own row. */}
          <nav
            aria-label="Admin"
            className="flex items-center gap-1 overflow-x-auto pb-2 sm:hidden"
          >
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-ink-body"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl">{title}</h1>
            {action}
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </>
  );
}

export function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-7 shadow-soft md:p-9">
        {children}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex items-center gap-3 text-sm text-ink-muted">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent"
        />
        Loading…
      </div>
    </div>
  );
}

function SetupRequired() {
  return (
    <CenteredCard>
      <Logo />
      <h1 className="mt-6 text-xl">Firebase isn’t connected yet</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-body">
        The admin area needs a Firebase project before anyone can sign in. Copy{" "}
        <code className="font-mono text-xs">.env.example</code> to{" "}
        <code className="font-mono text-xs">.env.local</code>, paste in the values
        from your Firebase project settings, and restart the dev server.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-body">
        Step-by-step instructions are in{" "}
        <code className="font-mono text-xs">SETUP.md</code>.
      </p>
      <ButtonLink href="/" variant="outline" className="mt-7">
        Back to the site
      </ButtonLink>
    </CenteredCard>
  );
}

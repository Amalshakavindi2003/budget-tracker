"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearToken, hasToken } from "@/lib/auth";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = useMemo(() => (pathname ? PUBLIC_ROUTES.has(pathname) : false), [pathname]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const authenticated = hasToken();

    if (!authenticated && !isPublic) {
      router.replace("/login");
      setIsReady(true);
      return;
    }

    if (authenticated && isPublic) {
      router.replace("/");
      setIsReady(true);
      return;
    }

    setIsReady(true);
  }, [isPublic, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-slate-300">
        <div className="rounded-2xl border border-line bg-surface/80 px-8 py-6 shadow-glow">Checking session...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function LogoutButton() {
  const router = useRouter();

  const onLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className="rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-accent-500 hover:text-white"
    >
      Logout
    </button>
  );
}
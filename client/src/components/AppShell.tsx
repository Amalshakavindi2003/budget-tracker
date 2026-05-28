"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./AuthGuard";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-30 border-b border-line bg-gradient-to-r from-bg/90 to-bg/70 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600/90 text-white shadow-md">SB</div>
            <div>
              <p className="font-[var(--font-heading)] text-xl tracking-tight text-white">Smart Budget Tracker</p>
              <p className="text-xs text-slate-400">Own your numbers every day</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-accent-600 text-white shadow"
                      : "text-slate-300 hover:bg-surfaceSoft hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

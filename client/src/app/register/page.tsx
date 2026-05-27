"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ name, email, password }),
      });

      setToken(payload.token);
      router.replace("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-line bg-surface/90 p-7 shadow-glow sm:p-9">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="font-[var(--font-heading)] text-3xl font-bold text-white">Create Account</h1>
            <p className="text-slate-400">Start your smart budgeting journey today.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-slate-300">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2.5 text-slate-100 outline-none transition focus:border-accent-500"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2.5 text-slate-100 outline-none transition focus:border-accent-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2.5 text-slate-100 outline-none transition focus:border-accent-500"
                placeholder="Minimum 6 characters"
              />
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent-100 hover:text-accent-50">
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </AuthGuard>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import TransactionForm from "@/components/TransactionForm";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionsResponse } from "@/lib/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiFetch<TransactionsResponse>("/transactions");
        setTransactions(data.transactions);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  const onCreated = (transaction: Transaction) => {
    setTransactions((current) => [transaction, ...current]);
  };

  return (
    <AuthGuard>
      <AppShell>
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-[var(--font-heading)] text-3xl font-bold text-white">Transactions</h1>
            <p className="text-slate-400">Capture every money move and keep spending under control.</p>
          </div>

          <TransactionForm onCreated={onCreated} />

          <section className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">All Transactions</h2>
              <span className="text-sm text-slate-400">{transactions.length} total</span>
            </div>

            {loading ? <p className="text-slate-300">Loading transactions...</p> : null}
            {error ? <p className="text-rose-300">{error}</p> : null}
            {!loading && !error && sortedTransactions.length === 0 ? (
              <p className="text-slate-300">No transactions added yet.</p>
            ) : null}

            {!loading && !error && sortedTransactions.length > 0 ? (
              <div className="space-y-3">
                {sortedTransactions.map((transaction) => (
                  <article
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-xl border border-line bg-surfaceSoft px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">{transaction.title}</p>
                      <p className="text-sm text-slate-400">
                        {transaction.category} | {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm uppercase tracking-wide text-slate-400">{transaction.type}</p>
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "income" ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import StatCard from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Transaction, TransactionsResponse } from "@/lib/types";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiFetch<TransactionsResponse>("/transactions");
        setTransactions(data.transactions);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const summary = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  return (
    <AuthGuard>
      <AppShell>
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-[var(--font-heading)] text-3xl font-bold text-white">Financial Overview</h1>
            <p className="text-slate-400">A quick snapshot of your spending and earning momentum.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total Income" amount={summary.income} tone="income" />
            <StatCard label="Total Expenses" amount={summary.expenses} tone="expense" />
            <StatCard label="Current Balance" amount={summary.balance} tone="balance" />
          </div>

          <section className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">Recent Transactions</h2>
              <p className="text-sm text-slate-400">{transactions.length} records</p>
            </div>

            {loading ? <p className="text-slate-300">Loading transactions...</p> : null}
            {error ? <p className="text-rose-300">{error}</p> : null}

            {!loading && !error && transactions.length === 0 ? (
              <p className="text-slate-300">No transactions yet. Add one on the Transactions page.</p>
            ) : null}

            {!loading && !error && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="px-3 py-2 font-medium">Title</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 8).map((transaction) => (
                      <tr key={transaction.id} className="rounded-xl bg-surfaceSoft text-slate-200">
                        <td className="rounded-l-xl px-3 py-3">{transaction.title}</td>
                        <td className="px-3 py-3">{transaction.category}</td>
                        <td className="px-3 py-3 capitalize">{transaction.type}</td>
                        <td
                          className={`rounded-r-xl px-3 py-3 text-right font-semibold ${
                            transaction.type === "income" ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
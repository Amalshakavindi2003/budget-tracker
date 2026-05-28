"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import StatCard from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
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

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

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

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter((transaction) => {
      const txDate = new Date(transaction.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const monthIncome = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const monthExpense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      transactionCount: monthTransactions.length,
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
    };
  }, [transactions]);

  const categoryExpenseBreakdown = useMemo(() => {
    const categoryTotals = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce<Record<string, number>>((accumulator, transaction) => {
        const key = transaction.category || "Other";
        accumulator[key] = (accumulator[key] ?? 0) + transaction.amount;
        return accumulator;
      }, {});

    const rows = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const total = rows.reduce((sum, row) => sum + row.amount, 0);

    return rows.map((row) => ({
      ...row,
      percent: total > 0 ? (row.amount / total) * 100 : 0,
    }));
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

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-line bg-surface/90 p-4 shadow-glow">
              <p className="text-xs uppercase tracking-wide text-slate-400">This Month Net</p>
              <p className={`mt-2 text-2xl font-semibold ${monthlyStats.monthNet >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {formatCurrency(monthlyStats.monthNet)}
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-surface/90 p-4 shadow-glow">
              <p className="text-xs uppercase tracking-wide text-slate-400">This Month Income</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{formatCurrency(monthlyStats.monthIncome)}</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface/90 p-4 shadow-glow">
              <p className="text-xs uppercase tracking-wide text-slate-400">This Month Expenses</p>
              <p className="mt-2 text-2xl font-semibold text-rose-300">{formatCurrency(monthlyStats.monthExpense)}</p>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-5">
            <article className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">Expense Mix</h2>
                <p className="text-xs text-slate-400">Top 5 categories</p>
              </div>

              {categoryExpenseBreakdown.length === 0 ? (
                <p className="text-sm text-slate-300">No expense data yet.</p>
              ) : (
                <div className="space-y-3">
                  {categoryExpenseBreakdown.map((row) => (
                    <div key={row.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">{row.category}</span>
                        <span className="text-slate-300">{formatCurrency(row.amount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-bg">
                        <div className="h-2 rounded-full bg-accent-500" style={{ width: `${row.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <section className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">Recent Transactions</h2>
                <p className="text-sm text-slate-400">{transactions.length} records</p>
              </div>

              {loading ? <p className="text-slate-300">Loading transactions...</p> : null}
              {error ? <p className="text-rose-300">{error}</p> : null}

              {!loading && !error && sortedTransactions.length === 0 ? (
                <p className="text-slate-300">No transactions yet. Add one on the Transactions page.</p>
              ) : null}

              {!loading && !error && sortedTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="px-3 py-2 font-medium">Title</th>
                        <th className="px-3 py-2 font-medium">Category</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTransactions.slice(0, 8).map((transaction) => (
                        <tr key={transaction.id} className="rounded-xl bg-surfaceSoft text-slate-200">
                          <td className="rounded-l-xl px-3 py-3">{transaction.title}</td>
                          <td className="px-3 py-3">{transaction.category}</td>
                          <td className="px-3 py-3 text-slate-400">{formatDate(transaction.date)}</td>
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
        </section>
      </AppShell>
    </AuthGuard>
  );
}

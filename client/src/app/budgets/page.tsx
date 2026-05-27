"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import BudgetForm from "@/components/BudgetForm";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { Budget, BudgetsResponse, Transaction, TransactionsResponse } from "@/lib/types";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetData, transactionData] = await Promise.all([
          apiFetch<BudgetsResponse>("/budgets"),
          apiFetch<TransactionsResponse>("/transactions"),
        ]);

        setBudgets(budgetData.budgets);
        setTransactions(transactionData.transactions);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const budgetInsights = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter((transaction) => {
          if (transaction.type !== "expense") {
            return false;
          }

          const transactionDate = new Date(transaction.date);

          return (
            transaction.category.toLowerCase() === budget.category.toLowerCase() &&
            transactionDate.getMonth() + 1 === budget.month &&
            transactionDate.getFullYear() === budget.year
          );
        })
        .reduce((total, transaction) => total + transaction.amount, 0);

      const progress = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;

      return {
        ...budget,
        spent,
        progress,
        remaining: budget.amount - spent,
      };
    });
  }, [budgets, transactions]);

  const onCreated = (budget: Budget) => {
    setBudgets((current) => [budget, ...current]);
  };

  return (
    <AuthGuard>
      <AppShell>
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-[var(--font-heading)] text-3xl font-bold text-white">Budgets</h1>
            <p className="text-slate-400">Set category targets and track real-time progress against spending.</p>
          </div>

          <BudgetForm onCreated={onCreated} />

          <section className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">Budget Limits</h2>
              <span className="text-sm text-slate-400">{budgets.length} categories</span>
            </div>

            {loading ? <p className="text-slate-300">Loading budgets...</p> : null}
            {error ? <p className="text-rose-300">{error}</p> : null}
            {!loading && !error && budgetInsights.length === 0 ? (
              <p className="text-slate-300">No budgets added yet.</p>
            ) : null}

            {!loading && !error && budgetInsights.length > 0 ? (
              <div className="space-y-4">
                {budgetInsights.map((budget) => (
                  <article key={budget.id} className="rounded-xl border border-line bg-surfaceSoft p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-100">{budget.category}</p>
                        <p className="text-sm text-slate-400">{formatMonthYear(budget.month, budget.year)}</p>
                      </div>
                      <p className="text-sm text-slate-300">
                        {formatCurrency(budget.spent)} spent of {formatCurrency(budget.amount)}
                      </p>
                    </div>

                    <div className="h-3 rounded-full bg-bg">
                      <div
                        className={`h-3 rounded-full ${budget.progress >= 100 ? "bg-rose-500" : "bg-accent-500"}`}
                        style={{ width: `${budget.progress}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">{Math.round(budget.progress)}% used</span>
                      <span className={budget.remaining >= 0 ? "text-emerald-300" : "text-rose-300"}>
                        Remaining: {formatCurrency(budget.remaining)}
                      </span>
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
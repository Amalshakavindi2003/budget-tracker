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
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const categories = useMemo(() => {
    const unique = new Set(transactions.map((transaction) => transaction.category));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter((transaction) => {
      const text = `${transaction.title} ${transaction.category}`.toLowerCase();
      const matchesQuery = query.trim() === "" || text.includes(query.trim().toLowerCase());
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || transaction.category.toLowerCase() === categoryFilter.toLowerCase();
      const dateValue = new Date(transaction.date).getTime();
      const fromMatch = fromDate ? dateValue >= new Date(fromDate).getTime() : true;
      const toMatch = toDate ? dateValue <= new Date(toDate).getTime() : true;

      return matchesQuery && matchesType && matchesCategory && fromMatch && toMatch;
    });
  }, [sortedTransactions, query, typeFilter, categoryFilter, fromDate, toDate]);

  const filteredSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const expense = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  const onCreated = (transaction: Transaction) => {
    setTransactions((current) => [transaction, ...current]);
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setFromDate("");
    setToDate("");
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
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">Smart Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500 hover:text-white"
              >
                Reset
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
                placeholder="Search title or category"
              />

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "all" | "income" | "expense")}
                className="rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
              />

              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-line bg-surfaceSoft px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Filtered Income</p>
                <p className="text-lg font-semibold text-emerald-300">{formatCurrency(filteredSummary.income)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surfaceSoft px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Filtered Expense</p>
                <p className="text-lg font-semibold text-rose-300">{formatCurrency(filteredSummary.expense)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surfaceSoft px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Filtered Balance</p>
                <p className="text-lg font-semibold text-cyan-300">{formatCurrency(filteredSummary.balance)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-white">All Transactions</h2>
              <span className="text-sm text-slate-400">
                {filteredTransactions.length} of {transactions.length} total
              </span>
            </div>

            {loading ? <p className="text-slate-300">Loading transactions...</p> : null}
            {error ? <p className="text-rose-300">{error}</p> : null}
            {!loading && !error && filteredTransactions.length === 0 ? (
              <p className="text-slate-300">No matching transactions found for the selected filters.</p>
            ) : null}

            {!loading && !error && filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
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

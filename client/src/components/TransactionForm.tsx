"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Transaction, TransactionType } from "@/lib/types";

interface TransactionFormProps {
  onCreated: (transaction: Transaction) => void;
}

const today = new Date().toISOString().split("T")[0];

export default function TransactionForm({ onCreated }: TransactionFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = await apiFetch<{ transaction: Transaction }>("/transactions", {
        method: "POST",
        body: JSON.stringify({
          title,
          amount: Number(amount),
          type,
          category,
          date,
        }),
      });

      onCreated(payload.transaction);
      setTitle("");
      setAmount("");
      setCategory("");
      setType("expense");
      setDate(today);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-surface/90 p-5 shadow-glow sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <label className="text-sm text-slate-300" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
          placeholder="Freelance payment"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300" htmlFor="amount">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min="0"
          step="0.01"
          required
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300" htmlFor="category">
          Category
        </label>
        <input
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
          placeholder="Food"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Transaction"}
        </button>
      </div>

      {error ? <p className="sm:col-span-2 lg:col-span-3 text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
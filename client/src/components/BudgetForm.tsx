"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Budget } from "@/lib/types";

interface BudgetFormProps {
  onCreated: (budget: Budget) => void;
}

const now = new Date();

export default function BudgetForm({ onCreated }: BudgetFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = await apiFetch<{ budget: Budget }>("/budgets", {
        method: "POST",
        body: JSON.stringify({
          category,
          amount: Number(amount),
          month: Number(month),
          year: Number(year),
        }),
      });

      onCreated(payload.budget);
      setCategory("");
      setAmount("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-surface/90 p-5 shadow-glow md:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        <label htmlFor="budget-category" className="text-sm text-slate-300">
          Category
        </label>
        <input
          id="budget-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
          placeholder="Food"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="budget-amount" className="text-sm text-slate-300">
          Limit
        </label>
        <input
          id="budget-amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
          placeholder="1000"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="budget-month" className="text-sm text-slate-300">
          Month
        </label>
        <select
          id="budget-month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((monthOption) => (
            <option key={monthOption} value={monthOption}>
              {monthOption}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="budget-year" className="text-sm text-slate-300">
          Year
        </label>
        <select
          id="budget-year"
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="w-full rounded-xl border border-line bg-surfaceSoft px-3 py-2 text-slate-100 outline-none transition focus:border-accent-500"
        >
          {yearOptions.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 lg:col-span-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Budget"}
        </button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </form>
  );
}
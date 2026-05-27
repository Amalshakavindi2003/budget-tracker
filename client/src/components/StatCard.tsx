import { formatCurrency } from "@/lib/format";

interface StatCardProps {
  label: string;
  amount: number;
  tone: "income" | "expense" | "balance";
}

const toneClassMap: Record<StatCardProps["tone"], string> = {
  income: "text-emerald-300",
  expense: "text-rose-300",
  balance: "text-cyan-300",
};

export default function StatCard({ label, amount, tone }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-surface/90 p-5 shadow-glow">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-3 font-[var(--font-heading)] text-3xl font-bold ${toneClassMap[tone]}`}>{formatCurrency(amount)}</p>
    </article>
  );
}
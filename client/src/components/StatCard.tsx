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
    <article className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface/80 to-surfaceSoft/60 p-5 shadow-xl">
      <div className="absolute -left-6 top-4 h-20 w-20 -rotate-12 rounded-full bg-accent-600/10" />
      <div className="relative">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-3 font-[var(--font-heading)] text-3xl ${toneClassMap[tone]}`}>{formatCurrency(amount)}</p>
      </div>
    </article>
  );
}

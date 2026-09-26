export default function StatCard({ icon: Icon, label, value, subtext, subtextDetail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon size={16} strokeWidth={1.75} />
        </div>
      </div>

      <p className="mb-2 text-[2rem] font-bold tracking-tight text-slate-900">{value}</p>

      {subtext && (
        <p className="mb-1 text-xs font-medium text-emerald-600">{subtext}</p>
      )}
      {subtextDetail && (
        <p className="text-xs text-slate-400">{subtextDetail}</p>
      )}
    </div>
  );
}
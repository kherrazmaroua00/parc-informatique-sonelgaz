export default function StatCard({ icon: Icon, label, value, subtext, subtextDetail }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
          {label}
        </p>
        <div className="text-gray-300">
          <Icon size={18} strokeWidth={1.75} />
        </div>
      </div>

      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

      {subtext && (
        <p className="text-xs text-emerald-600 font-medium mb-1">{subtext}</p>
      )}
      {subtextDetail && (
        <p className="text-xs text-gray-400">{subtextDetail}</p>
      )}
    </div>
  );
}
export default function StatCardMini({ icon: Icon, label, value, unit, accentColor = 'bg-slate-800' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
          {label}
        </p>
        <Icon size={16} strokeWidth={1.75} className="text-gray-300" />
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
      <div className={`h-1 w-8 rounded-full mt-2 ${accentColor}`} />
    </div>
  );
}
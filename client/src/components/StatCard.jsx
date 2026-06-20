const StatCard = ({ label, value, unit = '', icon, accent = false }) => (
  <div
    className={`card animate-slide-up hover:border-slate-800/80 transition-all duration-300 flex flex-col justify-between ${
      accent ? 'border-cyan-500/20 shadow-[0_0_15px_rgba(0,217,255,0.04)] bg-gradient-to-br from-cyan-950/10 to-navy-900/10' : 'bg-[#0a0f1e]/20'
    }`}
  >
    <div>
      {/* Icon badge */}
      <div className="w-10 h-10 rounded-xl border border-slate-900 bg-[#060a12] flex items-center justify-center text-base shrink-0 select-none shadow-sm">
        {icon}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1 mt-4">
        <span className={`text-3xl font-extrabold tracking-tight ${accent ? 'text-cyan-400' : 'text-white'}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500 font-semibold mb-1">{unit}</span>}
      </div>
    </div>

    {/* Label */}
    <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mt-2">
      {label}
    </p>
  </div>
);

export default StatCard;

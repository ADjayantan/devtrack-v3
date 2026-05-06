const StatCard = ({ label, value, unit = '', icon, accent = false }) => (
  <div
    className={`card animate-slide-up transition-all duration-200 hover:border-slate-600 ${
      accent ? 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-navy-800' : ''
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="label">{label}</p>
        <div className="flex items-end gap-1 mt-2">
          <span className={`text-3xl font-bold font-mono ${accent ? 'text-cyan-400' : 'text-white'}`}>
            {value}
          </span>
          {unit && <span className="text-sm text-slate-500 mb-1 font-mono">{unit}</span>}
        </div>
      </div>
      <span className="text-2xl opacity-70">{icon}</span>
    </div>
  </div>
);

export default StatCard;

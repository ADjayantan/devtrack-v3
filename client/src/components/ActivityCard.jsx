const TYPE_META = {
  exercise:  { icon: '💪', label: 'Exercise',   color: 'text-orange-400',  bg: 'bg-orange-950/30',  border: 'border-orange-900/50'  },
  reading:   { icon: '📚', label: 'Reading',    color: 'text-blue-400',    bg: 'bg-blue-950/30',    border: 'border-blue-900/50'    },
  meditation:{ icon: '🧘', label: 'Meditation', color: 'text-violet-400',  bg: 'bg-violet-950/30',  border: 'border-violet-900/50'  },
  coding:    { icon: '💻', label: 'Coding',     color: 'text-cyan-400',    bg: 'bg-cyan-950/30',    border: 'border-cyan-900/50'    },
  custom:    { icon: '🎯', label: 'Custom',     color: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-900/50' },
};

const INTENSITY_COLORS = {
  low:    'text-emerald-400 bg-emerald-950/40 border-emerald-900/50',
  medium: 'text-yellow-400  bg-yellow-950/40  border-yellow-900/50',
  high:   'text-red-400     bg-red-950/40     border-red-900/50',
};

const formatDuration = (mins) => {
  if (!mins) return null;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const ACCENT_BARS = {
  exercise:   'accent-bar-orange',
  coding:     'accent-bar-cyan',
  reading:    'accent-bar-violet',
  meditation: 'accent-bar-violet',
  custom:     'accent-bar-cyan',
};

const ActivityCard = ({ activity, onEdit, onDelete }) => {
  const meta = TYPE_META[activity.type] || TYPE_META.custom;
  const duration = formatDuration(activity.duration);
  const accentClass = ACCENT_BARS[activity.type] || 'accent-bar-cyan';

  return (
    <div className={`card hover:border-slate-700/60 transition-all duration-300 animate-slide-up relative overflow-hidden ${accentClass}`}>
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.bg} border ${meta.border} shadow-inner`}>
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${meta.color}`}>
              {meta.label}
            </span>
            {activity.intensity && (
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${INTENSITY_COLORS[activity.intensity]}`}>
                {activity.intensity}
              </span>
            )}
          </div>
          <p className="text-base text-white font-bold tracking-tight mt-1">{activity.name}</p>
          <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs font-mono">
            <span>{activity.date}</span>
            {duration && (
              <span className="flex items-center gap-1 text-slate-400 bg-navy-950/40 border border-slate-900 px-2 py-0.5 rounded-lg">
                ⏱ {duration}
              </span>
            )}
          </div>
          {activity.notes && (
            <div className="mt-3 text-xs text-slate-400 leading-relaxed bg-navy-950/30 border border-slate-900/50 p-3 rounded-xl font-sans">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">// notes</p>
              {activity.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 shrink-0 self-start">
          <button
            onClick={() => onEdit(activity)}
            className="text-[10px] text-slate-400 hover:text-white font-mono border border-slate-800 bg-navy-900/40
                       hover:border-slate-600 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider"
          >
            edit
          </button>
          <button
            onClick={() => onDelete(activity._id)}
            className="text-[10px] text-red-400 hover:text-red-300 font-mono border border-red-950/50 bg-red-950/5
                       hover:border-red-900/60 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider"
          >
            del
          </button>
        </div>
      </div>
    </div>
  );
};

export { TYPE_META };
export default ActivityCard;

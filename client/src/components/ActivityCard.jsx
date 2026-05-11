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

const ActivityCard = ({ activity, onEdit, onDelete }) => {
  const meta = TYPE_META[activity.type] || TYPE_META.custom;
  const duration = formatDuration(activity.duration);

  return (
    <div className={`card hover:border-slate-600 transition-all duration-200 animate-slide-up border ${meta.border}`}>
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${meta.bg} border ${meta.border}`}>
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-mono font-medium ${meta.color}`}>{meta.label}</span>
            {activity.intensity && (
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${INTENSITY_COLORS[activity.intensity]}`}>
                {activity.intensity}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 font-medium mt-0.5">{activity.name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-500 font-mono">{activity.date}</span>
            {duration && <span className="text-xs text-slate-400 font-mono">⏱ {duration}</span>}
          </div>
          {activity.notes && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{activity.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(activity)}
            className="text-xs text-slate-400 hover:text-white font-mono border border-slate-700
                       hover:border-slate-500 px-2.5 py-1.5 rounded-lg transition-all"
          >
            edit
          </button>
          <button
            onClick={() => onDelete(activity._id)}
            className="text-xs text-red-500 hover:text-red-400 font-mono border border-red-900/50
                       hover:border-red-700 px-2.5 py-1.5 rounded-lg transition-all"
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

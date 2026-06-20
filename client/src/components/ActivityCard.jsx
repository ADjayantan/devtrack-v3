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

  // Helper to derive mockup-style outline badges
  const getOutlineBadge = () => {
    if (activity.type === 'coding') {
      const lowerName = activity.name.toLowerCase();
      if (lowerName.includes('api') || lowerName.includes('backend') || lowerName.includes('database') || lowerName.includes('refactor') || lowerName.includes('sql') || lowerName.includes('server')) {
        return <span className="badge-outline-cyan">Backend</span>;
      }
      if (lowerName.includes('ui') || lowerName.includes('frontend') || lowerName.includes('css') || lowerName.includes('react') || lowerName.includes('component')) {
        return <span className="badge-outline-cyan">Frontend</span>;
      }
      return <span className="badge-outline-cyan">Coding</span>;
    }
    if (activity.type === 'reading') {
      return <span className="badge-outline-blue">Study</span>;
    }
    if (activity.type === 'meditation') {
      return <span className="badge-outline-violet">Mindfulness</span>;
    }
    if (activity.type === 'exercise') {
      if (activity.intensity) {
        return (
          <span className={`badge-outline-${activity.intensity === 'high' ? 'red' : activity.intensity === 'medium' ? 'orange' : 'cyan'} capitalize`}>
            {activity.intensity} Intensity
          </span>
        );
      }
      return <span className="badge-outline-orange">Workout</span>;
    }
    return <span className="badge-outline-cyan">Habit</span>;
  };

  return (
    <div className={`card hover:border-slate-800/80 transition-all duration-300 animate-slide-up relative overflow-hidden flex flex-col justify-between ${accentClass}`}>
      <div className="flex items-start gap-4">
        {/* Type icon in square glass box */}
        <div className="w-11 h-11 rounded-xl border border-slate-900 bg-[#060a12] flex items-center justify-center text-lg shrink-0 select-none shadow-sm">
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Date */}
          <p className="text-base text-white font-bold tracking-tight">{activity.name}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">{activity.date}</p>

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {duration && (
              <span className="badge-dark flex items-center gap-1">
                ⏱ {duration}
              </span>
            )}
            {getOutlineBadge()}
          </div>

          {/* Notes */}
          {activity.notes && (
            <div className="mt-3.5 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-900/50 pt-2.5">
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">// notes</p>
              {activity.notes}
            </div>
          )}
        </div>
      </div>

      {/* Monospace Action Links */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-900/50 select-none font-mono text-[10px] uppercase tracking-wider">
        <button
          onClick={() => onEdit(activity)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          [ edit ]
        </button>
        <button
          onClick={() => onDelete(activity._id)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          [ delete ]
        </button>
      </div>
    </div>
  );
};

export { TYPE_META };
export default ActivityCard;

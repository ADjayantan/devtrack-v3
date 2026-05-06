const MilestoneItem = ({ milestone, onToggle, onDelete }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group ${
      milestone.completed
        ? 'border-cyan-900/50 bg-cyan-950/20'
        : 'border-slate-700/50 hover:border-slate-600'
    }`}
  >
    {/* Checkbox toggle */}
    <button
      onClick={() => onToggle(milestone._id)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
        milestone.completed
          ? 'bg-cyan-500 border-cyan-500'
          : 'border-slate-600 hover:border-slate-400'
      }`}
      aria-label={milestone.completed ? 'Mark incomplete' : 'Mark complete'}
    >
      {milestone.completed && (
        <svg viewBox="0 0 10 8" className="w-3 h-3 text-navy-950" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 4l3 3 5-6" />
        </svg>
      )}
    </button>

    {/* Title */}
    <span
      className={`text-sm flex-1 transition-colors ${
        milestone.completed ? 'text-slate-500 line-through' : 'text-slate-200'
      }`}
    >
      {milestone.title}
    </span>

    {/* Completion date */}
    {milestone.completed && milestone.completedAt && (
      <span className="text-xs text-slate-600 font-mono hidden sm:block">
        {new Date(milestone.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>
    )}

    {/* Delete button — visible on hover */}
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(milestone._id); }}
      className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs px-1"
      aria-label="Delete milestone"
    >
      ✕
    </button>
  </div>
);

export default MilestoneItem;

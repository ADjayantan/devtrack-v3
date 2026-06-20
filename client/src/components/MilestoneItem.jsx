const MilestoneItem = ({ milestone, onToggle, onDelete }) => (
  <div className="flex items-center justify-between py-1 group select-none">
    <div className="flex items-center gap-3">
      {/* Checkbox toggle */}
      <button
        onClick={() => onToggle(milestone._id)}
        className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
          milestone.completed
            ? 'bg-cyan-500 border-cyan-500'
            : 'border-slate-500 bg-transparent hover:border-slate-350'
        }`}
        aria-label={milestone.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {milestone.completed && (
          <svg viewBox="0 0 10 8" className="w-3 h-3 text-navy-950 font-bold" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4l3 3 5-6" />
          </svg>
        )}
      </button>

      {/* Title */}
      <span
        className={`text-sm transition-colors ${
          milestone.completed ? 'text-slate-500 line-through' : 'text-slate-200 font-medium'
        }`}
      >
        {milestone.title}
      </span>
    </div>

    <div className="flex items-center gap-2">
      {/* Completion date */}
      {milestone.completed && milestone.completedAt && (
        <span className="text-[10px] text-slate-500 font-mono hidden sm:block">
          {new Date(milestone.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
        </span>
      )}

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(milestone._id); }}
        className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs px-1"
        aria-label="Delete milestone"
      >
        ✕
      </button>
    </div>
  </div>
);

export default MilestoneItem;

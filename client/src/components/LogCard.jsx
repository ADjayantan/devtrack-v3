import { formatDate } from '../utils/dateUtils';

const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

const LogCard = ({ log, onEdit, onDelete }) => (
  <div className="card hover:border-slate-600 transition-all duration-200 animate-slide-up">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-mono text-xs text-cyan-400">{formatDate(log.date)}</p>
          {log.mood && <span className="text-sm">{MOOD_LABELS[log.mood]}</span>}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">{log.learned}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-slate-400 font-mono">✓ {log.tasksCompleted} tasks</span>
          <span className="text-xs text-slate-400 font-mono">⏱ {log.hoursSpent}h</span>
        </div>
        {log.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {log.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => onEdit(log)}
          className="text-xs text-slate-400 hover:text-white font-mono border border-slate-700
                     hover:border-slate-500 px-2.5 py-1.5 rounded-lg transition-all">
          edit
        </button>
        <button onClick={() => onDelete(log._id)}
          className="text-xs text-red-500 hover:text-red-400 font-mono border border-red-900/50
                     hover:border-red-700 px-2.5 py-1.5 rounded-lg transition-all">
          del
        </button>
      </div>
    </div>
  </div>
);

export default LogCard;

import { formatDate } from '../utils/dateUtils';

const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };
const MOOD_EMOJIS = { 1: '🚀', 2: '🧠', 3: '🐛', 4: '😊', 5: '🤩' }; // Derived from mockup emojis

const LogCard = ({ log, onEdit, onDelete }) => (
  <div className="card hover:border-slate-800/80 transition-all duration-300 animate-slide-up flex flex-col justify-between">
    <div>
      {/* Card Header: Date + Emoji */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-sm font-bold text-white tracking-tight">{log.date}</p>
        <span className="text-base select-none">
          {log.mood ? (MOOD_EMOJIS[log.mood] || MOOD_LABELS[log.mood]) : '🚀'}
        </span>
      </div>

      {/* Horizontal Divider Line */}
      <div className="w-full border-t border-slate-900 mb-3" />

      {/* Learned Header */}
      <p className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-widest mb-1">
        // LEARNED
      </p>

      {/* Learned content */}
      <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1.5">{log.learned}</p>
    </div>

    {/* Footer area: tags + stats + actions */}
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-900/50">
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <span className="text-slate-400">✓</span> {log.tasksCompleted} tasks
        </span>
        <span className="flex items-center gap-1">
          <span className="text-slate-400">⏱</span> {log.hoursSpent}h studied
        </span>
        {log.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {log.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-mono font-bold text-cyan-500/80 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-950/40">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Monospace Action Links */}
      <div className="flex items-center gap-2 select-none font-mono text-[10px] uppercase tracking-wider">
        <button
          onClick={() => onEdit(log)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          [ edit ]
        </button>
        <button
          onClick={() => onDelete(log._id)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          [ delete ]
        </button>
      </div>
    </div>
  </div>
);

export default LogCard;

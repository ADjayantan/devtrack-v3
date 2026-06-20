import { formatDate } from '../utils/dateUtils';

const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };
const MOOD_EMOJIS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

const LogCard = ({ log, onEdit, onDelete }) => (
  <div className="card hover:border-slate-700/60 transition-all duration-300 animate-slide-up accent-bar-cyan">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="font-mono text-sm font-bold text-white tracking-tight">{log.date}</p>
          {log.mood && <span className="text-base">{MOOD_LABELS[log.mood] || '📝'}</span>}
        </div>
        
        <p className="label !mb-1.5">// learned</p>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">{log.learned}</p>
        
        <div className="flex items-center gap-4 mt-4 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="text-slate-400">✓</span> {log.tasksCompleted} tasks
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-400">⏱</span> {log.hoursSpent}h studied
          </span>
        </div>
        
        {log.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {log.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1.5 shrink-0 self-start">
        <button onClick={() => onEdit(log)}
          className="text-[10px] text-slate-400 hover:text-white font-mono border border-slate-800 bg-navy-900/40
                     hover:border-slate-600 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider">
          edit
        </button>
        <button onClick={() => onDelete(log._id)}
          className="text-[10px] text-red-400 hover:text-red-300 font-mono border border-red-950/50 bg-red-950/5
                     hover:border-red-900/60 px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wider">
          del
        </button>
      </div>
    </div>
  </div>
);

export default LogCard;

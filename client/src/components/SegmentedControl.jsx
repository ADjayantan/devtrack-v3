import { useNavigate, useLocation } from 'react-router-dom';

const SegmentedControl = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogs = location.pathname === '/logs';

  return (
    <div className="flex md:hidden bg-[#060a12] p-1 rounded-xl border border-slate-900 w-full select-none mb-4">
      <button
        type="button"
        onClick={() => navigate('/logs')}
        className={`flex-1 text-center py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all
          ${isLogs
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            : 'text-slate-500 hover:text-slate-400'
          }`}
      >
        // Daily Journal
      </button>
      <button
        type="button"
        onClick={() => navigate('/activities')}
        className={`flex-1 text-center py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all
          ${!isLogs
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            : 'text-slate-500 hover:text-slate-400'
          }`}
      >
        // Habit Logs
      </button>
    </div>
  );
};

export default SegmentedControl;

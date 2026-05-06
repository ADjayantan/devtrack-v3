import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLogs } from '../services/logService';
import { fetchRoadmaps } from '../services/roadmapService';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import WeeklyChart from '../components/WeeklyChart';
import LoadingSpinner from '../components/LoadingSpinner';

// FIX BUG-3: Dashboard now shows toast if API call fails
const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [logs, setLogs]       = useState([]);
  const [stats, setStats]     = useState({ totalDays: 0, totalTasks: 0, totalHours: 0, streak: 0 });
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [logsRes, roadmapsRes] = await Promise.all([
          fetchLogs({ limit: 50 }),
          fetchRoadmaps(),
        ]);
        setLogs(logsRes.data.logs);
        setStats(logsRes.data.stats);
        setRoadmaps(roadmapsRes.data.roadmaps);
      } catch (err) {
        toast.error('Failed to load dashboard. ' + err.message); // FIX BUG-3
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const recentLog     = logs[0];
  const activeRoadmap = roadmaps[0];
  const doneMilestones = activeRoadmap?.milestones.filter((m) => m.completed).length ?? 0;
  const totalMilestones = activeRoadmap?.milestones.length ?? 0;
  const roadmapProgress = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

  // Daily goal progress (today's log vs user goal)
  const todayStr  = new Date().toISOString().split('T')[0];
  const todayLog  = logs.find((l) => l.date === todayStr);
  const goalHours = user?.dailyGoalHours || 2;
  const goalPct   = todayLog ? Math.min(100, Math.round((todayLog.hoursSpent / goalHours) * 100)) : 0;

  const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Greeting */}
      <div className="animate-fade-in">
        <p className="font-mono text-cyan-500 text-sm mb-1">// welcome back</p>
        <h1 className="text-2xl font-bold text-white">
          {user?.name.split(' ')[0]}'s Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {stats.streak > 0 ? `🔥 ${stats.streak}-day streak — keep going!` : 'Log today to start a streak.'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Day Streak"   value={stats.streak}     icon="🔥" accent />
        <StatCard label="Days Tracked" value={stats.totalDays}  icon="📅" />
        <StatCard label="Tasks Done"   value={stats.totalTasks} icon="✓" />
        <StatCard label="Hours Spent"  value={stats.totalHours} unit="h" icon="⏱" />
      </div>

      {/* Chart + Roadmap + Daily Goal */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart logs={logs} />
        </div>

        <div className="space-y-4">
          {/* Daily Goal card */}
          <div className="card">
            <p className="label mb-3">Today's Goal</p>
            {todayLog ? (
              <>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>{todayLog.hoursSpent}h / {goalHours}h</span>
                  <span className={goalPct >= 100 ? 'text-emerald-400' : 'text-cyan-400'}>{goalPct}%</span>
                </div>
                <div className="h-2 bg-navy-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${goalPct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-cyan-400'}`}
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
                {todayLog.mood && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    mood: {MOOD_LABELS[todayLog.mood]} · {todayLog.tasksCompleted} tasks
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-slate-500 text-xs mb-3">No log today yet</p>
                <Link to="/logs" className="btn-primary text-xs">Log Now</Link>
              </div>
            )}
          </div>

          {/* Active Roadmap card */}
          <div className="card flex flex-col">
            <p className="label mb-3">Active Roadmap</p>
            {activeRoadmap ? (
              <>
                <p className="text-white font-semibold text-sm mb-4">{activeRoadmap.title}</p>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>progress</span>
                  <span className="text-cyan-400">{roadmapProgress}%</span>
                </div>
                <div className="h-2 bg-navy-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${roadmapProgress}%` }} />
                </div>
                <p className="text-xs text-slate-500 font-mono mt-2">{doneMilestones}/{totalMilestones} milestones</p>
                <Link to="/roadmap" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono mt-3 self-start">view roadmap →</Link>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-slate-500 text-sm">No roadmap yet</p>
                <Link to="/roadmap" className="btn-primary mt-3 text-xs">Create Roadmap</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent log */}
      {recentLog && (
        <div className="card border-slate-700/50 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="label">Latest Entry</p>
            <Link to="/logs" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono">view all →</Link>
          </div>
          <p className="font-mono text-xs text-cyan-500 mb-2">{recentLog.date}</p>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{recentLog.learned}</p>
          <div className="flex gap-4 mt-3">
            <span className="text-xs font-mono text-slate-500">{recentLog.tasksCompleted} tasks</span>
            <span className="text-xs font-mono text-slate-500">{recentLog.hoursSpent}h</span>
            {recentLog.mood && <span className="text-xs font-mono text-slate-500">{MOOD_LABELS[recentLog.mood]}</span>}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">No logs yet. Start tracking your progress!</p>
          <Link to="/logs" className="btn-primary">Add Your First Log</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

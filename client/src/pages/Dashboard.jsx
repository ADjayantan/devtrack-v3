import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLogs } from '../services/logService';
import { fetchRoadmaps } from '../services/roadmapService';
import { fetchTodayActivities } from '../services/activityService';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import WeeklyChart from '../components/WeeklyChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { TYPE_META } from '../components/ActivityCard';
import { today } from '../utils/dateUtils';

// FIX BUG-3: Dashboard now shows toast if API call fails
const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [logs, setLogs]             = useState([]);
  const [stats, setStats]           = useState({ totalDays: 0, totalTasks: 0, totalHours: 0, streak: 0 });
  const [roadmaps, setRoadmaps]     = useState([]);
  const [todayActivities, setTodayActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const localToday = today();
        const [logsRes, roadmapsRes, activitiesRes] = await Promise.all([
          fetchLogs({ limit: 50, today: localToday }),
          fetchRoadmaps(),
          fetchTodayActivities({ date: localToday }),
        ]);
        setLogs(logsRes.data.logs);
        setStats(logsRes.data.stats);
        setRoadmaps(roadmapsRes.data.roadmaps);
        setTodayActivities(activitiesRes.data.activities);
      } catch (err) {
        toast.error('Failed to load dashboard. ' + err.message);
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
  const todayStr  = today();
  const todayLog  = logs.find((l) => l.date === todayStr);
  const goalHours = user?.dailyGoalHours || 2;
  const goalPct   = todayLog ? Math.min(100, Math.round((todayLog.hoursSpent / goalHours) * 100)) : 0;

  const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

  const getMonthDay = (dateStr) => {
    if (!dateStr) return { month: 'OCT', day: '00' };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { month: 'OCT', day: '00' };
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = parts[2];
    return { month, day };
  };

  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalPct / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24 md:pb-8">
      {/* Greeting */}
      <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-cyan-500 text-sm mb-1">// welcome back</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {user?.name ? user.name.split(' ')[0] : 'John'}'s Dashboard
          </h1>
        </div>
        {stats.streak > 0 && (
          <div className="bg-[#0f1729]/50 border border-slate-900 px-4 py-2.5 rounded-xl flex items-center gap-2 select-none self-start md:self-auto">
            <span className="text-base">🔥</span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              {stats.streak}-Day Streak
            </span>
          </div>
        )}
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
            <p className="label mb-3">// Daily Goal</p>
            {todayLog ? (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r={radius}
                      className="stroke-slate-900 fill-none"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx="50" cy="50" r={radius}
                      className="stroke-cyan-400 fill-none transition-all duration-700 drop-shadow-[0_0_6px_rgba(34,211,238,0.2)]"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold font-mono text-white">{goalPct}%</span>
                </div>
                <p className="text-sm font-bold text-white mt-4 font-mono">
                  {todayLog.hoursSpent} <span className="text-slate-500">/</span> {goalHours}h today
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs mb-4">No log today yet</p>
                <Link to="/logs" className="btn-primary text-xs w-full">Log Now</Link>
              </div>
            )}
          </div>

          {/* Active Roadmap card */}
          <div className="card flex flex-col">
            <p className="label mb-3">// Roadmap</p>
            {activeRoadmap ? (
              <>
                <p className="text-white font-bold text-sm mb-4 truncate">{activeRoadmap.title}</p>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${roadmapProgress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{doneMilestones}/{totalMilestones} milestones</span>
                  <span className="text-cyan-400 font-extrabold">{roadmapProgress}%</span>
                </div>
                <Link to="/roadmap" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono mt-4 self-start">view roadmap →</Link>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <p className="text-slate-500 text-sm mb-3">No roadmap yet</p>
                <Link to="/roadmap" className="btn-primary w-full text-xs">Create Roadmap</Link>
              </div>
            )}
          </div>

          {/* Today's Activities card */}
          <div className="card">
            <p className="label">// Today's Activities</p>
            <div className="flex flex-wrap gap-2.5 mt-4">
              {todayActivities.map((a) => {
                const m = TYPE_META[a.type] || TYPE_META.custom;
                return (
                  <div key={a._id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-900 bg-[#0f1729]/30 text-xs select-none">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-slate-300 font-bold capitalize">{a.name}</span>
                  </div>
                );
              })}
              <Link to="/activities" className="flex items-center justify-center w-9 h-9 rounded-xl border border-dashed border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-sm font-bold font-mono">
                +
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent log */}
      {recentLog && (
        <div className="card border-slate-900 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <p className="label">// Recent Log</p>
            <Link to="/logs" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono">view all →</Link>
          </div>
          {(() => {
            const { month, day } = getMonthDay(recentLog.date);
            return (
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center justify-center w-12 h-14 bg-[#060a12] border border-slate-900 rounded-xl select-none shrink-0 font-mono">
                  <span className="text-[9px] font-extrabold text-slate-500 tracking-wider">{month}</span>
                  <span className="text-lg font-bold text-white leading-none mt-1">{day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white flex items-center gap-1.5 mb-2 truncate">
                    {recentLog.mood ? MOOD_LABELS[recentLog.mood] : '📝'}{' '}
                    {recentLog.learned.split(/[.!?]/)[0] || 'Learning Entry'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                    {recentLog.learned}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {logs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4 font-sans">No logs yet. Start tracking your progress!</p>
          <Link to="/logs" className="btn-primary">Add Your First Log</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

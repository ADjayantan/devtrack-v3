import { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/logService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell,
} from 'recharts';

const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

// GitHub-style activity heatmap
const Heatmap = ({ data }) => {
  const map = new Map(data.map((d) => [d.date, d.hours]));
  const weeks = [];
  const today = new Date();
  
  // Set start date to exactly 26 weeks ago, aligned to local calendar day
  const start = new Date(today);
  start.setDate(start.getDate() - 181);
  start.setHours(0, 0, 0, 0);

  let current = new Date(start);
  let week = [];
  while (current <= today) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const hours = map.get(dateStr) || 0;
    week.push({ date: dateStr, hours });
    if (current.getDay() === 6) { 
      weeks.push(week); 
      week = []; 
    }
    current.setDate(current.getDate() + 1);
  }
  if (week.length) weeks.push(week);

  const getColor = (h) => {
    if (h === 0) return 'bg-slate-800/40';
    if (h < 1)   return 'bg-cyan-950/80 border border-cyan-900/30';
    if (h < 2)   return 'bg-cyan-800/70 border border-cyan-700/30';
    if (h < 4)   return 'bg-cyan-600/80 border border-cyan-500/40';
    return 'bg-cyan-400 border border-cyan-300/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]';
  };

  return (
    <div className="card">
      <p className="label mb-4">// Activity Heatmap (6 months)</p>
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((day) => (
              <div key={day.date} title={`${day.date}: ${day.hours}h`}
                className={`w-3.5 h-3.5 rounded-[3px] ${getColor(day.hours)} transition-all duration-200 hover:scale-110 cursor-default`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2.5 mt-4 text-[10px] text-slate-500 font-mono">
        <span>Less</span>
        {['bg-slate-800/40', 'bg-cyan-950/80', 'bg-cyan-800/70', 'bg-cyan-600/80', 'bg-cyan-400'].map((c) => (
          <div key={c} className={`w-3 h-3 rounded-[3px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs font-mono shadow-2xl">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 font-semibold" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const toast = useToast();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(({ data }) => setData(data))
      .catch((err) => toast.error('Failed to load analytics: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return <div className="text-center py-20 text-slate-500 font-mono">No analytics data yet.</div>;

  const { monthly, topTags, moodTrend, heatmap } = data;

  // Calculate dynamic stats
  const totalHours = heatmap.reduce((s, h) => s + h.hours, 0);
  const totalTasks = heatmap.reduce((s, h) => s + (h.tasks || 0), 0);
  const avgHours = heatmap.length ? (totalHours / heatmap.length).toFixed(1) : '0';

  // Calculate dynamic Best Streak
  const uniqueDatesSorted = [...new Set(heatmap.map(h => h.date))].sort();
  let bestStreak = 0;
  let currentStreak = 0;
  let prevDate = null;
  for (const dateStr of uniqueDatesSorted) {
    const d = new Date(dateStr + 'T00:00:00Z');
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diff = (d - prevDate) / 86400000;
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        currentStreak = 1;
      }
    }
    prevDate = d;
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="font-mono text-cyan-500 text-sm">// metrics & analytics</p>
        <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">Performance Overview</h1>
      </div>

      {/* 4 Stat Cards matching mockup */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="card border-l-4 border-l-cyan-400">
          <p className="label">// Avg Daily Hours</p>
          <div className="flex items-end gap-1.5 mt-2">
            <span className="text-3xl font-bold font-mono text-white">{avgHours}</span>
            <span className="text-xs text-slate-500 font-mono mb-1">hrs</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-mono mt-2">📈 +12% from last week</p>
        </div>

        {/* Card 2 */}
        <div className="card border-l-4 border-l-cyan-400">
          <p className="label">// Best Streak</p>
          <div className="flex items-end gap-1.5 mt-2">
            <span className="text-3xl font-bold font-mono text-white">{bestStreak}</span>
            <span className="text-xs text-slate-500 font-mono mb-1">days</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">Current streak active</p>
        </div>

        {/* Card 3 */}
        <div className="card border-l-4 border-l-cyan-400">
          <p className="label">// Tasks Completed</p>
          <div className="flex items-end gap-1.5 mt-2">
            <span className="text-3xl font-bold font-mono text-white">{totalTasks}</span>
            <span className="text-xs text-slate-500 font-mono mb-1">done</span>
          </div>
          <p className="text-[10px] text-red-400 font-mono mt-2">📉 -3% from last week</p>
        </div>

        {/* Card 4 */}
        <div className="card border-l-4 border-l-cyan-400">
          <p className="label">// Deep Work Ratio</p>
          <div className="flex items-end gap-1.5 mt-2">
            <span className="text-3xl font-bold font-mono text-white">68%</span>
            <span className="text-xs text-slate-500 font-mono mb-1">ratio</span>
          </div>
          <p className="text-[10px] text-cyan-400 font-mono mt-2">⚡ Top 10% this month</p>
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap data={heatmap} />

      {/* Monthly hours + tasks charts */}
      <div className="card">
        <p className="label mb-5">// Monthly Overview</p>
        {monthly.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8 font-mono">Log some entries to see monthly trends.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: '#64748b', paddingTop: 10 }} />
              <Bar dataKey="hours" name="Hours" fill="#22d3ee" fillOpacity={0.85} radius={[4,4,0,0]} />
              <Bar dataKey="tasks" name="Tasks" fill="#8b5cf6" fillOpacity={0.8} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown matching mockup */}
        <div className="card flex flex-col justify-between">
          <div>
            <p className="label mb-4">// Category Breakdown</p>
            <div className="space-y-4">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Coding / Development</span>
                  <span className="text-cyan-400 font-extrabold">45%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full">
                  <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.3)]" style={{ width: '45%' }} />
                </div>
              </div>
              {/* Item 2 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Reviews / Pull Requests</span>
                  <span className="text-violet-400 font-extrabold">25%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full">
                  <div className="h-full bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]" style={{ width: '25%' }} />
                </div>
              </div>
              {/* Item 3 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Learning & Research</span>
                  <span className="text-blue-400 font-extrabold">15%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full">
                  <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: '15%' }} />
                </div>
              </div>
              {/* Item 4 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Meetings & Operations</span>
                  <span className="text-slate-500 font-extrabold">15%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Trend glowing line chart */}
        <div className="card">
          <p className="label mb-4">// Mood Trend (last 30 days)</p>
          {moodTrend.length < 2 ? (
            <p className="text-slate-500 text-sm font-mono py-10 text-center">Log mood in your entries to track it here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={moodTrend} margin={{ right: 10 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false}
                  tickFormatter={(d) => d.slice(5)} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]}
                  tickFormatter={(v) => MOOD_LABELS[v]}
                  tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148,163,184,0.06)' }} />
                {/* Thick glow line */}
                <Line type="monotone" dataKey="mood" stroke="#22d3ee" strokeWidth={6} strokeOpacity={0.15} dot={false} activeDot={false} />
                {/* Main line */}
                <Line type="monotone" dataKey="mood" stroke="#22d3ee" strokeWidth={2.5}
                  dot={{ fill: '#060a12', stroke: '#22d3ee', strokeWidth: 2, r: 4.5 }} name="Mood" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

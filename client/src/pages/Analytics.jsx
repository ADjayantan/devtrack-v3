import { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/logService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
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
      <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-4">// Activity Heatmap (6 months)</p>
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
      <div className="flex items-center gap-2.5 mt-4 text-[10px] text-slate-500 font-mono select-none">
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
    <div className="bg-[#050814] border border-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono shadow-2xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 font-bold" style={{ color: p.color }}>
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
  const [activeWeek, setActiveWeek] = useState('W4');

  useEffect(() => {
    fetchAnalytics()
      .then(({ data }) => setData(data))
      .catch((err) => toast.error('Failed to load analytics: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return <div className="text-center py-20 text-slate-500 font-mono">No analytics data yet.</div>;

  const { topTags, moodTrend, heatmap } = data;

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

  // Calculate W1-W4 weekly data
  const getWeeklySummary = (heatmap) => {
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999);
    
    const w4Start = new Date(todayDate); w4Start.setDate(w4Start.getDate() - 6); w4Start.setHours(0, 0, 0, 0);
    const w3Start = new Date(w4Start); w3Start.setDate(w3Start.getDate() - 7);
    const w2Start = new Date(w3Start); w2Start.setDate(w2Start.getDate() - 7);
    const w1Start = new Date(w2Start); w1Start.setDate(w1Start.getDate() - 7);

    let w1Hours = 0, w2Hours = 0, w3Hours = 0, w4Hours = 0;
    let w1Tasks = 0, w2Tasks = 0, w3Tasks = 0, w4Tasks = 0;

    heatmap.forEach((day) => {
      const d = new Date(day.date + 'T00:00:00');
      if (d >= w4Start && d <= todayDate) {
        w4Hours += day.hours;
        w4Tasks += (day.tasks || 0);
      } else if (d >= w3Start && d < w4Start) {
        w3Hours += day.hours;
        w3Tasks += (day.tasks || 0);
      } else if (d >= w2Start && d < w3Start) {
        w2Hours += day.hours;
        w2Tasks += (day.tasks || 0);
      } else if (d >= w1Start && d < w2Start) {
        w1Hours += day.hours;
        w1Tasks += (day.tasks || 0);
      }
    });

    return [
      { name: 'W1', hours: parseFloat(w1Hours.toFixed(1)), tasks: w1Tasks },
      { name: 'W2', hours: parseFloat(w2Hours.toFixed(1)), tasks: w2Tasks },
      { name: 'W3', hours: parseFloat(w3Hours.toFixed(1)), tasks: w3Tasks },
      { name: 'W4', hours: parseFloat(w4Hours.toFixed(1)), tasks: w4Tasks },
    ];
  };

  const weeklySummary = getWeeklySummary(heatmap);

  // Dynamic tags classification
  let codingCount = 0;
  let reviewCount = 0;
  let learningCount = 0;
  let meetingCount = 0;
  
  topTags.forEach(({ tag, count }) => {
    const t = tag.toLowerCase();
    if (t.includes('code') || t.includes('dev') || t.includes('api') || t.includes('frontend') || t.includes('backend')) {
      codingCount += count;
    } else if (t.includes('review') || t.includes('pr') || t.includes('git') || t.includes('github') || t.includes('merge')) {
      reviewCount += count;
    } else if (t.includes('learn') || t.includes('study') || t.includes('research') || t.includes('read') || t.includes('book')) {
      learningCount += count;
    } else if (t.includes('meeting') || t.includes('ops') || t.includes('admin') || t.includes('call') || t.includes('sync')) {
      meetingCount += count;
    }
  });

  const totalTagCounts = codingCount + reviewCount + learningCount + meetingCount;
  const codingPct = totalTagCounts > 0 ? Math.round((codingCount / totalTagCounts) * 100) : 45;
  const reviewPct = totalTagCounts > 0 ? Math.round((reviewCount / totalTagCounts) * 100) : 25;
  const learningPct = totalTagCounts > 0 ? Math.round((learningCount / totalTagCounts) * 100) : 15;
  const meetingPct = totalTagCounts > 0 ? Math.round((meetingCount / totalTagCounts) * 100) : 15;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-24 md:pb-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="font-mono text-cyan-500 text-sm mb-1">// metrics & analytics</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Performance Overview</h1>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Daily Hours" value={avgHours} unit="hrs" icon="⏱️" accent />
        <StatCard label="Best Streak" value={bestStreak} unit="days" icon="🔥" />
        <StatCard label="Tasks Completed" value={totalTasks} unit="done" icon="✅" />
        <StatCard label="Deep Work Ratio" value="68" unit="%" icon="⚡" />
      </div>

      {/* Heatmap */}
      <Heatmap data={heatmap} />

      {/* Weekly summary cards (W1-W4) with glowing active week */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 select-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </span>
          <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest select-none">Weekly Performance Tracker</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {weeklySummary.map((w) => {
            const isActive = w.name === activeWeek;
            return (
              <div
                key={w.name}
                onClick={() => setActiveWeek(w.name)}
                className={`card cursor-pointer transition-all duration-300 select-none flex flex-col justify-between ${
                  isActive
                    ? 'border-cyan-500/50 bg-[#00d9ff]/5 shadow-[0_0_15px_rgba(0,217,255,0.1)]'
                    : 'hover:border-slate-800 bg-[#0a0f1e]/20 border-slate-900/50'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className={`text-[10px] font-mono font-bold tracking-widest ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {w.name} {isActive && '● ACTIVE'}
                  </span>
                  <span className="text-xs shrink-0">{isActive ? '⚡' : '📅'}</span>
                </div>
                <div className="mt-3.5">
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight">{w.hours}h</div>
                  <p className="text-[9px] font-mono font-bold text-slate-500 mt-1 uppercase tracking-wider">{w.tasks} tasks completed</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two separate weekly charts (Hours and Tasks) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hours Per Week Chart */}
        <div className="card">
          <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-5 select-none">// Hours Per Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklySummary} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.02)' }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {weeklySummary.map((entry, index) => {
                  const isSelected = entry.name === activeWeek;
                  return (
                    <Cell
                      key={`cell-hours-${index}`}
                      fill={isSelected ? '#00d9ff' : 'rgba(6, 182, 212, 0.25)'}
                      stroke={isSelected ? '#ffffff' : 'transparent'}
                      strokeWidth={isSelected ? 1.5 : 0}
                      className={isSelected ? 'drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]' : ''}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks Per Week Chart */}
        <div className="card">
          <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-5 select-none">// Tasks Per Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklySummary} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.02)' }} />
              <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                {weeklySummary.map((entry, index) => {
                  const isSelected = entry.name === activeWeek;
                  return (
                    <Cell
                      key={`cell-tasks-${index}`}
                      fill={isSelected ? '#a855f7' : 'rgba(168, 85, 247, 0.25)'}
                      stroke={isSelected ? '#ffffff' : 'transparent'}
                      strokeWidth={isSelected ? 1.5 : 0}
                      className={isSelected ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & Mood Trend */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-6 select-none">// Category Breakdown</p>
            <div className="space-y-4">
              {/* Coding */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Coding / Development</span>
                  <span className="text-cyan-400 font-extrabold">{codingPct}%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${codingPct}%` }} />
                </div>
              </div>
              {/* Reviews */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Reviews / Pull Requests</span>
                  <span className="text-purple-400 font-extrabold">{reviewPct}%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${reviewPct}%` }} />
                </div>
              </div>
              {/* Learning */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Learning & Research</span>
                  <span className="text-blue-400 font-extrabold">{learningPct}%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${learningPct}%` }} />
                </div>
              </div>
              {/* Meetings */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-bold">Meetings & Operations</span>
                  <span className="text-slate-500 font-extrabold">{meetingPct}%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full transition-all duration-500" style={{ width: `${meetingPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Trend curved line chart */}
        <div className="card">
          <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest mb-4 select-none">// Mood Trend (last 30 days)</p>
          {moodTrend.length < 2 ? (
            <p className="text-slate-500 text-sm font-mono py-10 text-center select-none">Log mood in your entries to track it here.</p>
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

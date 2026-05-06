import { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/logService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const MOOD_LABELS = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };

// GitHub-style activity heatmap
const Heatmap = ({ data }) => {
  const map = new Map(data.map((d) => [d.date, d.hours]));
  const weeks = [];
  const today = new Date();
  // Build 26 weeks (6 months) of days
  const start = new Date(today);
  start.setDate(start.getDate() - 181);

  let current = new Date(start);
  let week = [];
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    const hours = map.get(dateStr) || 0;
    week.push({ date: dateStr, hours });
    if (current.getDay() === 6) { weeks.push(week); week = []; }
    current.setDate(current.getDate() + 1);
  }
  if (week.length) weeks.push(week);

  const getColor = (h) => {
    if (h === 0)  return 'bg-slate-800';
    if (h < 1)   return 'bg-cyan-900';
    if (h < 2)   return 'bg-cyan-700';
    if (h < 4)   return 'bg-cyan-500';
    return 'bg-cyan-300';
  };

  return (
    <div className="card">
      <p className="label mb-4">Activity Heatmap (6 months)</p>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div key={day.date} title={`${day.date}: ${day.hours}h`}
                className={`w-3 h-3 rounded-sm ${getColor(day.hours)} transition-colors cursor-default`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-mono">
        <span>less</span>
        {['bg-slate-800','bg-cyan-900','bg-cyan-700','bg-cyan-500','bg-cyan-300'].map((c) => (
          <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
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
  if (!data)   return <div className="text-center py-20 text-slate-500">No analytics data yet.</div>;

  const { monthly, topTags, moodTrend, heatmap } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="animate-fade-in">
        <p className="font-mono text-cyan-500 text-sm">// analytics</p>
        <h1 className="text-2xl font-bold text-white mt-1">Progress Analytics</h1>
      </div>

      {/* Heatmap */}
      <Heatmap data={heatmap} />

      {/* Monthly hours + tasks */}
      <div className="card">
        <p className="label mb-5">Monthly Overview</p>
        {monthly.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Log some entries to see monthly trends.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: '#64748b' }} />
              <Bar dataKey="hours" name="Hours" fill="#00d9ff" fillOpacity={0.8} radius={[4,4,0,0]} />
              <Bar dataKey="tasks" name="Tasks" fill="#8b5cf6" fillOpacity={0.75} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Tags */}
        <div className="card">
          <p className="label mb-4">Top Tags</p>
          {topTags.length === 0 ? (
            <p className="text-slate-500 text-sm">Add tags to your logs to see frequency here.</p>
          ) : (
            <div className="space-y-3">
              {topTags.map(({ tag, count }) => {
                const pct = Math.round((count / topTags[0].count) * 100);
                return (
                  <div key={tag}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-cyan-400">{tag}</span>
                      <span className="text-slate-500">{count}x</span>
                    </div>
                    <div className="h-1.5 bg-navy-950 rounded-full">
                      <div className="h-full bg-cyan-500/70 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mood Trend */}
        <div className="card">
          <p className="label mb-4">Mood Trend (last 30 days)</p>
          {moodTrend.length < 2 ? (
            <p className="text-slate-500 text-sm">Log mood in your entries to track it here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={moodTrend}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
                  tickFormatter={(d) => d.slice(5)} />
                <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]}
                  tickFormatter={(v) => MOOD_LABELS[v]}
                  tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148,163,184,0.1)' }} />
                <Line type="monotone" dataKey="mood" stroke="#f59e0b" strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }} name="Mood" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { buildWeeklyData } from '../utils/chartUtils';

// Fix FE-PERF-02: O(n²) lookup eliminated in chartUtils
// Fix FE-UX-03: Real chart library (Recharts) replaces the hand-rolled SVG bars

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-cyan-400">{payload[0]?.value}h studied</p>
      {payload[1] && <p className="text-violet-400">{payload[1]?.value} tasks</p>}
    </div>
  );
};

const WeeklyChart = ({ logs }) => {
  const data = buildWeeklyData(logs);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <p className="label">7-Day Activity</p>
        <div className="flex gap-4 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-cyan-500 inline-block" /> hours
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" /> tasks
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={3} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />

          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.hasEntry ? '#00d9ff' : '#1e293b'}
                fillOpacity={entry.hasEntry ? 0.85 : 1}
              />
            ))}
          </Bar>

          <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.hasEntry ? '#8b5cf6' : '#1e293b'}
                fillOpacity={entry.hasEntry ? 0.75 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;

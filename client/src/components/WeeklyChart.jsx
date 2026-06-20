import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { buildWeeklyData } from '../utils/chartUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono shadow-2xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-cyan-400 font-bold">{payload[0]?.value}h studied</p>
    </div>
  );
};

const renderCustomBarLabel = ({ x, y, width, value, index }) => {
  if (index === 6 && value > 0) {
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#00d9ff"
        fontSize={10}
        fontFamily="IBM Plex Mono"
        fontWeight="bold"
        textAnchor="middle"
      >
        {value}h
      </text>
    );
  }
  return null;
};

const CustomXAxisTick = ({ x, y, payload, index }) => {
  const isToday = index === 6;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={14}
        fill={isToday ? '#00d9ff' : '#64748b'}
        fontSize={10}
        fontFamily="IBM Plex Mono"
        fontWeight={isToday ? 'bold' : 'normal'}
        textAnchor="middle"
      >
        {payload.value.toUpperCase()}
      </text>
    </g>
  );
};

const WeeklyChart = ({ logs }) => {
  const data = buildWeeklyData(logs);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <p className="label">// Weekly Activity</p>
        <span className="text-slate-500 text-sm select-none">📊</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.04)" />
          <XAxis
            dataKey="label"
            tick={<CustomXAxisTick />}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.03)' }} />

          <Bar dataKey="hours" radius={[4, 4, 0, 0]} label={renderCustomBarLabel}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={i === 6 ? '#00d9ff' : (entry.hasEntry ? 'rgba(6,182,212,0.3)' : '#1e293b')}
                className={i === 6 ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]' : ''}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;

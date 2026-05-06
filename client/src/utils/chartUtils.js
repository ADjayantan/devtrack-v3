import { getLastNDays } from './dateUtils';

// Fix FE-PERF-02: Original had O(n²) — data.find() inside a map.
// Now we build a Map first (O(n)) then do O(1) lookups.
export const buildWeeklyData = (logs) => {
  const days = getLastNDays(7);

  // Build lookup Map once — O(n)
  const logMap = new Map(logs.map((l) => [l.date, l]));

  return days.map((date) => {
    const log = logMap.get(date); // O(1)
    const label = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
    return {
      date,
      label,
      hours: log ? parseFloat(log.hoursSpent.toFixed(1)) : 0,
      tasks: log ? log.tasksCompleted : 0,
      hasEntry: !!log,
    };
  });
};

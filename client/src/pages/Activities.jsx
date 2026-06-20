import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import {
  fetchActivities, createActivity, updateActivity, deleteActivity,
} from '../services/activityService';
import ActivityCard, { TYPE_META } from '../components/ActivityCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { today } from '../utils/dateUtils';
import SegmentedControl from '../components/SegmentedControl';


// ─── Constants ────────────────────────────────────────────────────────────────
const TYPES = ['exercise', 'reading', 'meditation', 'coding', 'custom'];

const DEFAULT_NAMES = {
  exercise:   'Workout',
  reading:    'Reading session',
  meditation: 'Meditation',
  coding:     'Coding session',
  custom:     '',
};

const makeEmptyForm = () => ({
  date:      today(),
  type:      'exercise',
  name:      'Workout',
  duration:  30,
  intensity: 'medium',
  notes:     '',
});

// ─── Activity Form ────────────────────────────────────────────────────────────
const ActivityForm = ({ form, setForm, editId, submitting, onSubmit, onCancel }) => {
  const [errors, setErrors] = useState({});

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      name: DEFAULT_NAMES[type] || prev.name,
      intensity: type === 'exercise' ? (prev.intensity || 'medium') : '',
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.duration < 0 || form.duration > 1440) e.duration = 'Duration must be 0–1440 min';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try { await onSubmit(); } catch { /* toast handled in parent */ }
  };

  return (
    <div className="card border-cyan-500/20 animate-slide-up">
      <p className="label mb-4">{editId ? 'Edit Activity' : 'Log Activity'}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="label">Activity Type</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => {
              const m = TYPE_META[t];
              const active = form.type === t;
              return (
                <button
                  key={t} type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all
                    ${active
                      ? `${m.bg} ${m.border} ${m.color} font-semibold`
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <span>{m.icon}</span> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Activity Name</label>
            <input className={`input ${errors.name ? 'border-red-600' : ''}`}
              type="text" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Morning run" maxLength={100} />
            {errors.name && <p className="text-red-400 text-xs mt-1 font-mono">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Date</label>
            <input className={`input ${errors.date ? 'border-red-600' : ''}`}
              type="date" value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            {errors.date && <p className="text-red-400 text-xs mt-1 font-mono">{errors.date}</p>}
          </div>
        </div>

        {/* Duration + Intensity row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duration (minutes)</label>
            <input className={`input ${errors.duration ? 'border-red-600' : ''}`}
              type="number" value={form.duration} min={0} max={1440}
              onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
            {errors.duration && <p className="text-red-400 text-xs mt-1 font-mono">{errors.duration}</p>}
          </div>

          {/* Intensity — only for exercise */}
          {form.type === 'exercise' && (
            <div>
              <label className="label">Intensity</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((lvl) => (
                  <button key={lvl} type="button"
                    onClick={() => setForm((p) => ({ ...p, intensity: lvl }))}
                    className={`flex-1 py-2 text-xs font-mono rounded-lg border transition-all capitalize
                      ${form.intensity === lvl
                        ? lvl === 'low'    ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400'
                          : lvl === 'medium' ? 'bg-yellow-950/50 border-yellow-700 text-yellow-400'
                          : 'bg-red-950/50 border-red-700 text-red-400'
                        : 'border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input resize-none" rows={2}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Any notes about this activity..." maxLength={500} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'saving...' : editId ? 'Update' : 'Log Activity'}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Activities = () => {
  const toast   = useToast();
  const confirm = useConfirm();

  const [activities, setActivities]   = useState([]);
  const [stats, setStats]             = useState({ totalActivities: 0, totalDuration: 0, typeCounts: {} });
  const [pagination, setPagination]   = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false, totalCount: 0 });
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(makeEmptyForm);
  const [editId, setEditId]           = useState(null);
  const [typeFilter, setTypeFilter]   = useState('');
  const [page, setPage]               = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (typeFilter) params.type = typeFilter;
      const { data } = await fetchActivities(params);
      setActivities(data.activities);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load activities: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        duration: Number(form.duration) || 0,
        intensity: form.type === 'exercise' ? form.intensity : null,
      };
      if (editId) {
        await updateActivity(editId, payload);
        toast.success('Activity updated ✓');
      } else {
        await createActivity(payload);
        toast.success('Activity logged! 💪');
      }
      setForm(makeEmptyForm());
      setEditId(null);
      setShowForm(false);
      await load();
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setForm({
      date:      activity.date,
      type:      activity.type,
      name:      activity.name,
      duration:  activity.duration || 0,
      intensity: activity.intensity || 'medium',
      notes:     activity.notes || '',
    });
    setEditId(activity._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this activity? This cannot be undone.');
    if (!ok) return;
    try {
      await deleteActivity(id);
      toast.success('Activity deleted.');
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cancelForm = () => {
    setForm(makeEmptyForm());
    setEditId(null);
    setShowForm(false);
  };

  // Format total duration
  const fmtDuration = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (!h) return `${m}m`;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  // Top activity type
  const topType = Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <p className="font-mono text-cyan-500 text-sm">// activities</p>
          <h1 className="text-2xl font-bold text-white mt-1">Daily Habits</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-3 py-2">
            + Log Activity
          </button>
        )}
      </div>

      {/* Mobile Logs/Habits Switcher */}
      <SegmentedControl />

      {/* Stats bar */}
      <div className="hidden md:flex flex-wrap gap-4 font-mono text-xs text-slate-400 border-b border-slate-800 pb-4">
        <span>🎯 <span className="text-white">{stats.totalActivities}</span> total</span>
        <span>⏱ <span className="text-white">{fmtDuration(stats.totalDuration)}</span> logged</span>
        {topType && (
          <span>
            {TYPE_META[topType[0]]?.icon} top: <span className="text-white">{topType[0]}</span>{' '}
            <span className="text-slate-600">({topType[1]}x)</span>
          </span>
        )}
      </div>

      {/* Log form */}
      {showForm && (
        <ActivityForm
          form={form} setForm={setForm} editId={editId}
          submitting={submitting} onSubmit={handleSubmit} onCancel={cancelForm}
        />
      )}

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 select-none animate-fade-in">
        <button
          onClick={() => { setTypeFilter(''); setPage(1); }}
          className={`px-4 py-1.5 text-xs font-sans rounded-full border transition-all
            ${!typeFilter 
              ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-semibold' 
              : 'border-slate-900 bg-[#0a0f1e]/20 text-slate-400 hover:text-slate-200'}`}
        >
          All
        </button>
        {TYPES.map((t) => {
          const m = TYPE_META[t];
          const active = typeFilter === t;
          return (
            <button key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`flex items-center gap-1 px-4 py-1.5 text-xs font-sans rounded-full border transition-all
                ${active 
                  ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-semibold' 
                  : 'border-slate-900 bg-[#0a0f1e]/20 text-slate-400 hover:text-slate-200'}`}
            >
              <span>{m.icon}</span> {m.label}
              {stats.typeCounts[t] ? (
                <span className="text-slate-500/80 ml-1 font-mono text-[10px]">({stats.typeCounts[t]})</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Activity list */}
      {loading ? (
        <LoadingSpinner />
      ) : activities.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 text-sm">
            {typeFilter ? `No ${typeFilter} activities yet.` : 'No activities logged yet.'}
          </p>
          <p className="text-slate-600 text-xs font-mono mt-1">
            Start logging your daily habits to build consistency.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <ActivityCard key={a._id} activity={a} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
    </div>
  );
};

export default Activities;

import { useState } from 'react';
import { useLogs } from '../hooks/useLogs';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { exportLogsCSV } from '../services/logService';
import LogCard from '../components/LogCard';
import LogFilters from '../components/LogFilters';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const MOOD_OPTIONS = [
  { value: '1', label: '😞 Rough' },
  { value: '2', label: '😕 Meh' },
  { value: '3', label: '😐 Okay' },
  { value: '4', label: '😊 Good' },
  { value: '5', label: '🤩 Great' },
];

const LogForm = ({ form, editId, submitting, onFormChange, onSubmit, onCancel }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.learned || form.learned.trim().length < 10) e.learned = 'Write at least 10 characters';
    if (form.hoursSpent < 0 || form.hoursSpent > 24) e.hoursSpent = 'Hours must be 0–24';
    if (form.tasksCompleted < 0 || form.tasksCompleted > 100) e.tasksCompleted = 'Tasks must be 0–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    // FIX BUG-1: wrap in try/catch so errors surface to the parent toast handler
    try {
      await onSubmit();
    } catch {
      // error already handled in parent via toast
    }
  };

  return (
    <div className="card border-cyan-500/20 animate-slide-up">
      <p className="label mb-4">{editId ? 'Edit Entry' : 'New Entry'}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: date + numbers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input className={`input ${errors.date ? 'border-red-600' : ''}`}
              type="date" name="date" value={form.date} onChange={onFormChange} required />
            {errors.date && <p className="text-red-400 text-xs mt-1 font-mono">{errors.date}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Tasks ✓</label>
              <input className={`input ${errors.tasksCompleted ? 'border-red-600' : ''}`}
                type="number" name="tasksCompleted" value={form.tasksCompleted}
                onChange={onFormChange} min={0} max={100} />
              {errors.tasksCompleted && <p className="text-red-400 text-xs mt-1 font-mono">{errors.tasksCompleted}</p>}
            </div>
            <div>
              <label className="label">Hours ⏱</label>
              <input className={`input ${errors.hoursSpent ? 'border-red-600' : ''}`}
                type="number" name="hoursSpent" value={form.hoursSpent}
                onChange={onFormChange} min={0} max={24} step={0.5} />
              {errors.hoursSpent && <p className="text-red-400 text-xs mt-1 font-mono">{errors.hoursSpent}</p>}
            </div>
          </div>
        </div>

        {/* Learned */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label !mb-0">What I Learned</label>
            <span className={`text-xs font-mono ${form.learned.length > 1800 ? 'text-red-400' : 'text-slate-600'}`}>
              {form.learned.length}/2000
            </span>
          </div>
          <textarea className={`input resize-none ${errors.learned ? 'border-red-600' : ''}`}
            name="learned" value={form.learned} onChange={onFormChange}
            rows={4} placeholder="Describe what you learned today... (min 10 chars)" maxLength={2000} />
          {errors.learned && <p className="text-red-400 text-xs mt-1 font-mono">{errors.learned}</p>}
        </div>

        {/* Row 2: mood + tags */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Mood 😊</label>
            <select className="input" name="mood" value={form.mood} onChange={onFormChange}>
              <option value="">— skip —</option>
              {MOOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" type="text" name="tags" value={form.tags}
              onChange={onFormChange} placeholder="react, node, dsa" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'saving...' : editId ? 'Update Log' : 'Save Log'}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const DailyLogs = () => {
  const toast   = useToast();
  const confirm = useConfirm();
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting]     = useState(false);

  const {
    logs, stats, pagination, loading, submitting,
    form, editId, showForm, filters,
    handleFormChange, handleFilterChange, handlePageChange,
    startEdit, cancelForm, submitLog, removeLog, setShowForm,
  } = useLogs();

  // FIX BUG-4: isEdit determined inside submitLog() now — no stale closure
  const handleSubmit = async () => {
    try {
      const wasEdit = await submitLog();
      toast.success(wasEdit ? 'Log updated ✓' : 'Log saved! Keep going 🔥');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this log entry? This cannot be undone.');
    if (!ok) return;
    try {
      await removeLog(id);
      toast.success('Log deleted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (log) => {
    startEdit(log);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportLogsCSV();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a   = document.createElement('a');
      a.href = url; a.download = 'devtrack-logs.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <p className="font-mono text-cyan-500 text-sm">// daily logs</p>
          <h1 className="text-2xl font-bold text-white mt-1">Learning Journal</h1>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={handleExport} disabled={exporting}
            className="btn-ghost text-xs px-3 py-2">
            {exporting ? '...' : '↓ CSV'}
          </button>
          <button onClick={() => setShowFilters((p) => !p)}
            className={`btn-ghost text-xs px-3 py-2 ${showFilters ? 'border-cyan-500/40 text-cyan-400' : ''}`}>
            ⊟ Filter
          </button>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-3 py-2">
              + New Log
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-400 border-b border-slate-800 pb-4">
        <span>🔥 <span className="text-white">{stats.streak || 0}</span> streak</span>
        <span>📅 <span className="text-white">{stats.totalDays || 0}</span> days</span>
        <span>⏱ <span className="text-white">{stats.totalHours || 0}h</span></span>
        <span>✓ <span className="text-white">{stats.totalTasks || 0}</span> tasks</span>
      </div>

      {showFilters && <LogFilters onFilterChange={handleFilterChange} activeFilters={filters} />}

      {showForm && (
        <LogForm form={form} editId={editId} submitting={submitting}
          onFormChange={handleFormChange} onSubmit={handleSubmit} onCancel={cancelForm} />
      )}

      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 text-sm">No logs found.</p>
          <p className="text-slate-600 text-xs font-mono mt-1">
            {filters.search || filters.tag ? 'Try different filters.' : 'Start tracking to build your streak.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogCard key={log._id} log={log} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
};

export default DailyLogs;

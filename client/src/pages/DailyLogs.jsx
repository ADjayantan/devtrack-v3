import { useState, useEffect } from 'react';
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
    logs, stats, pagination, loading, submitting, loadError,
    form, editId, showForm, filters,
    handleFormChange, handleFilterChange, handlePageChange,
    startEdit, cancelForm, submitLog, removeLog, setShowForm,
  } = useLogs();

  const [searchText, setSearchText] = useState(filters.search || '');
  const [localTag, setLocalTag]       = useState(filters.tag || '');
  const [startDate, setStartDate]     = useState(filters.startDate || '');
  const [endDate, setEndDate]         = useState(filters.endDate || '');

  // Surface load errors from the hook as toasts
  useEffect(() => {
    if (loadError) toast.error('Failed to load logs: ' + loadError.message);
  }, [loadError]);

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

  const applyFilters = () => {
    handleFilterChange({
      search: searchText,
      tag: localTag,
      startDate,
      endDate,
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setLocalTag('');
    setStartDate('');
    setEndDate('');
    handleFilterChange({
      search: '',
      tag: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = filters.search || filters.tag || filters.startDate || filters.endDate;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in gap-4">
        <div>
          <p className="font-mono text-cyan-500 text-sm">// daily logs</p>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">Daily Logs</h1>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button onClick={handleExport} disabled={exporting}
            className="btn-ghost text-xs px-4 py-2 border border-slate-800 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            {exporting ? '...' : 'Export CSV'}
          </button>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-lg">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              New Log Entry
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-400 border-b border-slate-900 pb-4 select-none">
        <span>🔥 <span className="text-cyan-400 font-bold">{stats.streak || 0}</span> streak</span>
        <div className="border-l border-slate-850 h-4" />
        <span>📅 <span className="text-white font-bold">{stats.totalDays || 0}</span> days</span>
        <div className="border-l border-slate-850 h-4" />
        <span>⏱ <span className="text-white font-bold">{stats.totalHours || 0}h</span> studies</span>
        <div className="border-l border-slate-850 h-4" />
        <span>✓ <span className="text-white font-bold">{stats.totalTasks || 0}</span> tasks done</span>
      </div>

      {/* Search & Filter Card */}
      <div className="card space-y-4 border border-slate-800 bg-navy-900/10">
        <div className="relative">
          <input
            className="input pl-10"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Search logs..."
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`btn-ghost text-xs px-3.5 py-2 flex items-center gap-1.5 ${showFilters ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/5' : ''}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Filter
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider ml-auto">
              [ Clear Filters ]
            </button>
          )}

          {!hasActiveFilters && (searchText || localTag || startDate || endDate) && (
            <button onClick={applyFilters} className="btn-primary text-[10px] px-3 py-1.5 ml-auto">
              Apply
            </button>
          )}
          {hasActiveFilters && (searchText !== filters.search || localTag !== filters.tag || startDate !== filters.startDate || endDate !== filters.endDate) && (
            <button onClick={applyFilters} className="btn-primary text-[10px] px-3 py-1.5 ml-auto">
              Update
            </button>
          )}
        </div>

        {/* Expandable Filter Details */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-900 animate-slide-up">
            {/* Tag search */}
            <div>
              <label className="label">Filter by Tag</label>
              <input
                className="input"
                type="text"
                value={localTag}
                onChange={(e) => setLocalTag(e.target.value)}
                placeholder="e.g. react, node"
              />
            </div>
            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">From Date</label>
                <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label">To Date</label>
                <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <LogForm form={form} editId={editId} submitting={submitting}
          onFormChange={handleFormChange} onSubmit={handleSubmit} onCancel={cancelForm} />
      )}

      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 text-sm font-mono">No logs found.</p>
          <p className="text-slate-600 text-xs font-mono mt-1">
            {hasActiveFilters ? 'Try different search queries or clear your filters.' : 'Start tracking to build your streak.'}
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

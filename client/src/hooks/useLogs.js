import { useState, useEffect, useCallback } from 'react';
import { fetchLogs, createLog, updateLog, deleteLog } from '../services/logService';
import { today } from '../utils/dateUtils';

// Compute today() inside the factory function, not at module load time
const makeEmptyForm = () => ({
  date: today(),
  learned: '',
  tasksCompleted: 0,
  hoursSpent: 0,
  tags: '',
  mood: '',
});

export const useLogs = () => {
  const [logs, setLogs]             = useState([]);
  const [stats, setStats]           = useState({ totalDays: 0, totalTasks: 0, totalHours: 0, streak: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false, totalCount: 0 });
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters]       = useState({ page: 1, limit: 10, search: '', startDate: '', endDate: '', tag: '' });
  const [form, setForm]             = useState(makeEmptyForm);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [loadError, setLoadError]   = useState(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const { data } = await fetchLogs({ ...cleanParams, today: today() });
      setLogs(data.logs);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      // Surface the error to the component via state rather than letting it
      // propagate as an unhandled rejection from the useEffect callback.
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleFilterChange = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));

  const handlePageChange = (newPage) =>
    setFilters((prev) => ({ ...prev, page: newPage }));

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (log) => {
    setForm({
      date: log.date,
      learned: log.learned,
      tasksCompleted: log.tasksCompleted,
      hoursSpent: log.hoursSpent,
      tags: log.tags?.join(', ') || '',
      mood: log.mood ?? '',
    });
    setEditId(log._id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setForm(makeEmptyForm());
    setEditId(null);
    setShowForm(false);
  };

  // submitLog propagates errors to the caller (DailyLogs.jsx catches them for toast)
  // editId is captured in a local variable before the async gap to avoid stale closure
  const submitLog = async () => {
    const isEdit = Boolean(editId);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tasksCompleted: Number(form.tasksCompleted),
        hoursSpent: Number(form.hoursSpent),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        mood: form.mood ? Number(form.mood) : undefined,
      };
      if (isEdit) {
        await updateLog(editId, payload);
      } else {
        await createLog(payload);
      }
      cancelForm();
      await loadLogs();
      return isEdit; // caller uses this to pick the right toast message
    } catch (err) {
      throw err; // propagate — caller handles toast
    } finally {
      setSubmitting(false);
    }
  };

  const removeLog = async (id) => {
    await deleteLog(id);
    await loadLogs();
  };

  return {
    logs, stats, pagination, loading, submitting, loadError,
    form, editId, showForm, filters,
    handleFormChange, handleFilterChange, handlePageChange,
    startEdit, cancelForm, submitLog, removeLog, setShowForm,
  };
};

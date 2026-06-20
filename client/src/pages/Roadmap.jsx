import { useState, useEffect, useCallback } from 'react';
import { fetchRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap } from '../services/roadmapService';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import MilestoneItem from '../components/MilestoneItem';
import LoadingSpinner from '../components/LoadingSpinner';

// Fix FE-BUG-01: Replaced all window.confirm/alert with toast + confirm dialog
// Fix FE-UX-01: All actions now give toast feedback

const Roadmap = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState({ title: '', description: '' });
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadRoadmaps = useCallback(async () => {
    try {
      const { data } = await fetchRoadmaps();
      setRoadmaps(data.roadmaps);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRoadmaps(); }, [loadRoadmaps]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoadmap.title.trim()) return;
    setSubmitting(true);
    try {
      await createRoadmap(newRoadmap);
      setNewRoadmap({ title: '', description: '' });
      setShowCreateForm(false);
      await loadRoadmaps();
      toast.success('Roadmap created!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMilestone = async (roadmapId) => {
    const text = milestoneInputs[roadmapId]?.trim();
    if (!text) { toast.error('Milestone title cannot be empty.'); return; }
    try {
      await updateRoadmap(roadmapId, { addMilestone: text });
      setMilestoneInputs((prev) => ({ ...prev, [roadmapId]: '' }));
      await loadRoadmaps();
      toast.success('Milestone added.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleMilestone = async (roadmapId, milestoneId) => {
    try {
      await updateRoadmap(roadmapId, { toggleMilestone: milestoneId });
      await loadRoadmaps();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteMilestone = async (roadmapId, milestoneId) => {
    const ok = await confirm('Delete this milestone?');
    if (!ok) return;
    try {
      await updateRoadmap(roadmapId, { deleteMilestone: milestoneId });
      await loadRoadmaps();
      toast.success('Milestone removed.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteRoadmap = async (id) => {
    const ok = await confirm('Delete this entire roadmap and all its milestones? This cannot be undone.');
    if (!ok) return;
    try {
      await deleteRoadmap(id);
      await loadRoadmaps();
      toast.success('Roadmap deleted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="font-mono text-cyan-500 text-sm">// roadmaps</p>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">Roadmap</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Track strategic initiatives, feature rollouts, and technical milestones.
          </p>
        </div>
        {!showCreateForm && (
          <button onClick={() => setShowCreateForm(true)} className="btn-primary shrink-0">
            + New Roadmap
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="card border-cyan-500/20 animate-slide-up">
          <p className="label mb-4">New Roadmap</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                type="text"
                value={newRoadmap.title}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, title: e.target.value })}
                placeholder="e.g. 100 Days Full Stack"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input
                className="input"
                type="text"
                value={newRoadmap.description}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, description: e.target.value })}
                placeholder="A brief description"
                maxLength={500}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'creating...' : 'Create'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roadmap list */}
      {roadmaps.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 text-sm">No roadmaps yet.</p>
          <p className="text-slate-600 text-xs font-mono mt-1">Create one to track your learning journey.</p>
        </div>
      ) : (
        roadmaps.map((roadmap) => {
          const total = roadmap.milestones.length;
          const done = roadmap.milestones.filter((m) => m.completed).length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div key={roadmap._id} className="card space-y-5 animate-slide-up border-l-4 border-l-cyan-400">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">{roadmap.title}</h2>
                  {roadmap.description && (
                    <p className="text-slate-400 text-sm leading-relaxed">{roadmap.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteRoadmap(roadmap._id)}
                  className="w-9 h-9 rounded-xl border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:border-red-900/60 flex items-center justify-center transition-all shrink-0"
                  title="Delete Roadmap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Progress */}
              <div className="bg-navy-950/30 border border-slate-900 p-4 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold">{done} / {total} milestones</span>
                  <span className="text-cyan-400 font-extrabold">{progress}%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones Header */}
              {total > 0 && <p className="label !mb-2 tracking-widest font-mono">// milestones</p>}

              {/* Milestones List */}
              <div className="space-y-2">
                {roadmap.milestones.map((milestone) => (
                  <MilestoneItem
                    key={milestone._id}
                    milestone={milestone}
                    onToggle={(mid) => handleToggleMilestone(roadmap._id, mid)}
                    onDelete={(mid) => handleDeleteMilestone(roadmap._id, mid)}
                  />
                ))}
              </div>

              {/* Add milestone */}
              <div className="flex gap-2 pt-4 border-t border-slate-800/80">
                <input
                  className="input flex-1 text-sm bg-[#060a12]/40"
                  type="text"
                  placeholder="New milestone..."
                  value={milestoneInputs[roadmap._id] || ''}
                  onChange={(e) =>
                    setMilestoneInputs((prev) => ({ ...prev, [roadmap._id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(roadmap._id)}
                />
                <button onClick={() => handleAddMilestone(roadmap._id)} className="btn-ghost shrink-0">
                  Add
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Roadmap;

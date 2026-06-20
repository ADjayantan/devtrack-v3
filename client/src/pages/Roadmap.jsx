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

  const handleCreateStudyPlan = async () => {
    setSubmitting(true);
    try {
      const studyPlan = {
        title: '100-Day Coding Study Plan (Java)',
        description: 'Java edition · Amazon · Google · Microsoft · NVIDIA · Zoho · Trilogy coding round plan (Units C0-C13 + Mixed Mocks).',
        milestones: [
          'C0 (Days 1–5): Java Collections, Fast I/O, Big-O Complexity',
          'C1 (Days 6–12): Arrays + Two Pointers (Two Sum, Kadane, 3Sum, Trapping Rain Water)',
          'C2 (Days 13–19): Strings (Valid Anagram, Longest Common Prefix, Palindromic Substring)',
          'C3 (Days 20–25): Sliding Window + Hashing (Min Window Substring, Subarray Sum Equals K)',
          'C4 (Days 26–32): Linked List + LRU (Reverse LL, Merge Sorted, LRU Cache, k-Group)',
          'C5 (Days 33–38): Stack & Queue + Monotonic (Valid Parentheses, Daily Temperatures, Sliding Window Max)',
          'C6 (Days 39–47): Trees & BST (Diameter, LCA, Level Order, Validate BST, Max Path Sum)',
          'C7 (Days 48–52): Trie + Heap / Top-K (Implement Trie, Merge K Sorted, Find Median)',
          'C8 (Days 53–59): Recursion & Backtracking (Subsets, Permutations, Phone Letter Combos, N-Queens)',
          'C9 (Days 60–64): Greedy & Intervals (Jump Game, Merge Intervals, Meeting Rooms II)',
          'C10 (Days 65–74): Graphs (BFS/DFS, Course Schedule, Word Ladder, Dijkstra, DSU)',
          'C11 (Days 75–84): Dynamic Programming (House Robber, LIS, Word Break, Partition Equal Subset)',
          'C12 (Days 85–90): Hard Tier: Bit-ops, DSU, Segment/Fenwick Tree, Count Primes',
          'C13 (Days 91–95): Matrix + Math + Zoho-special (Spiral Matrix, Pattern Printing, Wildcard Matching)',
          'D (Days 96–100): Company Mixed Mock Sets (Amazon, Google, Microsoft, Zoho/NVIDIA, Trilogy)'
        ]
      };
      await createRoadmap(studyPlan);
      await loadRoadmaps();
      toast.success('100-Day Study Plan loaded successfully!');
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
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-24 md:pb-8 space-y-6">
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
          <div className="flex gap-2.5">
            <button
              onClick={handleCreateStudyPlan}
              className="btn-ghost shrink-0 px-4 py-2.5 font-mono uppercase text-xs tracking-wider border border-slate-900 bg-navy-950/40"
              disabled={submitting}
            >
              {submitting ? 'loading...' : '+ 100-Day Study Plan'}
            </button>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary shrink-0">
              + New Roadmap
            </button>
          </div>
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
            <div key={roadmap._id} className="card space-y-5 animate-slide-up border-l-4 border-l-cyan-500">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">{roadmap.title}</h2>
                  {roadmap.description && (
                    <p className="text-slate-400 text-sm leading-relaxed">{roadmap.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteRoadmap(roadmap._id)}
                  className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:border-red-500/40 flex items-center justify-center transition-all shrink-0"
                  title="Delete Roadmap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Progress */}
              <div className="pt-1">
                <div className="flex justify-between items-center text-xs font-mono mb-2 select-none">
                  <span className="text-slate-400 font-bold">{done} / {total} milestones</span>
                  <span className="text-cyan-400 font-extrabold">{progress}%</span>
                </div>
                <div className="h-2 bg-[#060a12] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones Header */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-900/40">
                <span className="text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </span>
                <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest select-none">MILESTONES</p>
              </div>

              {/* Milestones List */}
              {total > 0 ? (
                <div className="space-y-3.5 pl-1">
                  {roadmap.milestones.map((milestone) => (
                    <MilestoneItem
                      key={milestone._id}
                      milestone={milestone}
                      onToggle={(mid) => handleToggleMilestone(roadmap._id, mid)}
                      onDelete={(mid) => handleDeleteMilestone(roadmap._id, mid)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 font-mono pl-1 select-none">No milestones added yet.</p>
              )}

              {/* Add milestone */}
              <div className="flex gap-2 pt-4 border-t border-slate-900/50">
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
                <button onClick={() => handleAddMilestone(roadmap._id)} className="btn-ghost shrink-0 px-4 py-2 font-mono uppercase text-xs">
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

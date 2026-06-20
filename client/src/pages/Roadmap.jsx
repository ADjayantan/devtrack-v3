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
        description: 'Java edition · Amazon · Google · Microsoft · NVIDIA · Zoho · Trilogy coding round plan (Day-by-Day Calendar).',
        milestones: [
          'Day 1: C0 - Java setup: Collections video + IDE ready',
          'Day 2: C0 - Complexity (Big-O) + Java idioms',
          'Day 3: C0 - read Striver A2Z sheet structure & practice collections',
          'Day 4: C0 - Java Collections: study HashMap, HashSet, ArrayDeque',
          'Day 5: C0 - Java Collections: study PriorityQueue, TreeMap, Fast I/O',
          'Day 6: C1 - Arrays: Video + Two Sum, Best Time to Buy/Sell Stock',
          'Day 7: C1 - Arrays: Maximum Subarray (Kadane), Move Zeroes',
          'Day 8: C1 - Arrays: Rotate Array by K, Contains Duplicate',
          'Day 9: C1 - Arrays: Product of Array Except Self, Two Sum II',
          'Day 10: C1 - Arrays: Container With Most Water, 3Sum',
          'Day 11: C1 - Arrays: Trapping Rain Water (Hard ★)',
          'Day 12: C1 - Arrays: Revision of Kadane & Two Pointers',
          'Day 13: C2 - Strings: Video + Valid Anagram, Group Anagrams',
          'Day 14: C2 - Strings: First Unique Character, Longest Common Prefix',
          'Day 15: C2 - Strings: Valid Palindrome, Palindrome Number',
          'Day 16: C2 - Strings: String to Integer (atoi), Longest Substring w/o Repeat',
          'Day 17: C2 - Strings: Decode String, Longest Palindromic Substring',
          'Day 18: C2 - Strings: Revision & Zoho pattern/string focus',
          'Day 19: C2 - Strings: Practice edge cases (empty, case, spaces)',
          'Day 20: C3 - Sliding Window: Video + Minimum Window Substring',
          'Day 21: C3 - Sliding Window: Find All Anagrams in a String',
          'Day 22: C3 - Sliding Window: Permutation in String',
          'Day 23: C3 - Sliding Window: Subarray Sum Equals K',
          'Day 24: C3 - Sliding Window: Longest Consecutive Sequence',
          'Day 25: C3 - Sliding Window: Revision of prefix-sum + HashMap counting',
          'Day 26: C4 - Linked List: Video + Reverse Linked List',
          'Day 27: C4 - Linked List: Linked List Cycle (detect loop)',
          'Day 28: C4 - Linked List: Middle of the Linked List',
          'Day 29: C4 - Linked List: Merge Two Sorted Lists',
          'Day 30: C4 - Linked List: Add Two Numbers & Remove Nth Node',
          'Day 31: C4 - Linked List: Copy List with Random Pointer',
          'Day 32: C4 - Linked List: LRU Cache ★ & Reverse Nodes in k-Group',
          'Day 33: C5 - Stack & Queue: Video + Valid Parentheses, Min Stack',
          'Day 34: C5 - Stack & Queue: Daily Temperatures',
          'Day 35: C5 - Stack & Queue: Next Greater Element I',
          'Day 36: C5 - Stack & Queue: Evaluate Reverse Polish Notation',
          'Day 37: C5 - Stack & Queue: Implement Queue using Stacks',
          'Day 38: C5 - Stack & Queue: Largest Rectangle & Sliding Window Max',
          'Day 39: C6 - Trees & BST: Video + Max Depth, Invert Binary Tree',
          'Day 40: C6 - Trees & BST: Diameter, Balanced Binary Tree',
          'Day 41: C6 - Trees & BST: Subtree of Another Tree',
          'Day 42: C6 - Trees & BST: LCA of a BST & LCA of a Binary Tree',
          'Day 43: C6 - Trees & BST: Binary Tree Level Order Traversal',
          'Day 44: C6 - Trees & BST: Validate Binary Search Tree',
          'Day 45: C6 - Trees & BST: Binary Tree Right Side View',
          'Day 46: C6 - Trees & BST: Kth Smallest BST & Construct Tree (Pre+In)',
          'Day 47: C6 - Trees & BST: Max Path Sum & Serialize/Deserialize Tree',
          'Day 48: C7 - Trie + Heap: Video + Implement Trie (Prefix Tree)',
          'Day 49: C7 - Trie + Heap: Design Add and Search Words & Word Search II',
          'Day 50: C7 - Trie + Heap: Kth Largest Element & Top K Frequent Elements',
          'Day 51: C7 - Trie + Heap: K Closest Points to Origin & Task Scheduler',
          'Day 52: C7 - Trie + Heap: Merge k Sorted Lists & Find Median',
          'Day 53: C8 - Backtracking: Video + Subsets, Combination Sum',
          'Day 54: C8 - Backtracking: Permutations',
          'Day 55: C8 - Backtracking: Letter Combinations of a Phone Number',
          'Day 56: C8 - Backtracking: Generate Parentheses',
          'Day 57: C8 - Backtracking: Word Search',
          'Day 58: C8 - Backtracking: Palindrome Partitioning',
          'Day 59: C8 - Backtracking: N-Queens',
          'Day 60: C9 - Greedy: Video + Jump Game, Gas Station',
          'Day 61: C9 - Greedy: Merge Intervals ★',
          'Day 62: C9 - Greedy: Insert Interval',
          'Day 63: C9 - Greedy: Non-overlapping Intervals & Meeting Rooms II',
          'Day 64: C9 - Greedy: Partition Labels & revision',
          'Day 65: C10 - Graphs: Video + Number of Islands ★',
          'Day 66: C10 - Graphs: Clone Graph',
          'Day 67: C10 - Graphs: Rotting Oranges',
          'Day 68: C10 - Graphs: Course Schedule I & II',
          'Day 69: C10 - Graphs: Pacific Atlantic Water Flow',
          'Day 70: C10 - Graphs: Word Ladder (Hard)',
          'Day 71: C10 - Graphs: Number of Provinces (DSU)',
          'Day 72: C10 - Graphs: Redundant Connection (DSU) & Accounts Merge',
          'Day 73: C10 - Graphs: Network Delay Time (Dijkstra)',
          'Day 74: C10 - Graphs: Cheapest Flights K Stops & Min Cost to Connect',
          'Day 75: C11 - DP: Video + Climbing Stairs, House Robber I',
          'Day 76: C11 - DP: House Robber II',
          'Day 77: C11 - DP: Coin Change ★',
          'Day 78: C11 - DP: Longest Increasing Subsequence',
          'Day 79: C11 - DP: Word Break ★',
          'Day 80: C11 - DP: Decode Ways',
          'Day 81: C11 - DP: Partition Equal Subset Sum & Unique Paths',
          'Day 82: C11 - DP: Longest Common Subsequence',
          'Day 83: C11 - DP: Edit Distance (Hard) & Maximal Square',
          'Day 84: C11 - DP: Longest Increasing Path & Split Array & Palindrome II',
          'Day 85: C12 - Hard Tier: Video + Single Number, Number of 1 Bits',
          'Day 86: C12 - Hard Tier: Counting Bits & Reverse Bits',
          'Day 87: C12 - Hard Tier: Missing Number & Sum of Two Integers',
          'Day 88: C12 - Hard Tier: Range Sum Query (Fenwick) & Count Smaller',
          'Day 89: C12 - Hard Tier: Partition to K Equal Sum Subsets (Bitmask)',
          'Day 90: C12 - Hard Tier: Shortest Path Visiting All Nodes & Count Primes',
          'Day 91: C13 - Matrix + Math: Video + Spiral Matrix',
          'Day 92: C13 - Matrix + Math: Rotate Image & Set Matrix Zeroes',
          'Day 93: C13 - Matrix + Math: Wildcard Matching (Hard)',
          'Day 94: C13 - Matrix + Math: Pattern Printing (pyramids) - GFG',
          'Day 95: C13 - Matrix + Math: Mobile keypad - GFG & Sudoku Validator',
          'Day 96: D - Mocks: Mixed Set - Amazon (LRU, Islands, Word Break)',
          'Day 97: D - Mocks: Mixed Set - Google (Subarray Sum K, LCA, Word Ladder)',
          'Day 98: D - Mocks: Mixed Set - Microsoft (Reverse k-Group, Spiral Matrix, Clone Graph)',
          'Day 99: D - Mocks: Mixed Set - Zoho + NVIDIA (First Unique, Pattern, Wildcard, Single Num, LRU)',
          'Day 100: D - Mocks: Mixed Set - Trilogy (Split Array, Flights K Stops, Count Smaller)'
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

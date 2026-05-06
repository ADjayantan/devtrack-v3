const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, hasNextPage, hasPrevPage, totalCount } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-xs text-slate-500 font-mono">{totalCount} entries</span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="px-3 py-1.5 text-xs font-mono border border-slate-700 rounded-lg 
                     text-slate-400 hover:text-white hover:border-slate-500 
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← prev
        </button>

        {/* Page numbers — show max 5 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 2)
          .map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-xs font-mono rounded-lg transition-all ${
                p === page
                  ? 'bg-cyan-500 text-navy-950 font-bold'
                  : 'border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {p}
            </button>
          ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="px-3 py-1.5 text-xs font-mono border border-slate-700 rounded-lg 
                     text-slate-400 hover:text-white hover:border-slate-500 
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;

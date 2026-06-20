const Pagination = ({ pagination, onPageChange, variant = 'numbers' }) => {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-center gap-4 pt-4 select-none animate-fade-in">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="w-10 h-10 flex items-center justify-center border border-slate-900 bg-navy-950/20 text-slate-400 hover:text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="px-4 py-2 bg-navy-950/50 border border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-400">
          Page {page} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="w-10 h-10 flex items-center justify-center border border-slate-900 bg-navy-950/20 text-slate-400 hover:text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4 select-none animate-fade-in">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="w-9 h-9 flex items-center justify-center border border-slate-900 text-slate-500 hover:text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all"
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        const active = p === page;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 text-xs font-mono rounded-xl transition-all ${
              active
                ? 'border border-cyan-500 text-cyan-400 font-extrabold bg-cyan-500/5 shadow-[0_0_10px_rgba(6,182,212,0.05)]'
                : 'border border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="w-9 h-9 flex items-center justify-center border border-slate-900 text-slate-500 hover:text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;

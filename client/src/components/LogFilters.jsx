import { useState } from 'react';

const LogFilters = ({ onFilterChange, activeFilters }) => {
  const [search, setSearch] = useState(activeFilters.search || '');
  const [startDate, setStartDate] = useState(activeFilters.startDate || '');
  const [endDate, setEndDate] = useState(activeFilters.endDate || '');
  const [tag, setTag] = useState(activeFilters.tag || '');

  const hasActiveFilters = search || startDate || endDate || tag;

  const apply = () => {
    onFilterChange({ search, startDate, endDate, tag });
  };

  const clear = () => {
    setSearch(''); setStartDate(''); setEndDate(''); setTag('');
    onFilterChange({ search: '', startDate: '', endDate: '', tag: '' });
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="label">Filter Logs</p>
        {hasActiveFilters && (
          <button onClick={clear} className="text-xs text-red-400 font-mono hover:text-red-300 transition-colors">
            clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Keyword search */}
        <div className="sm:col-span-2">
          <label className="label">Keyword Search</label>
          <input
            className="input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="Search in what you learned..."
          />
        </div>

        {/* Date range */}
        <div>
          <label className="label">From</label>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {/* Tag filter */}
        <div>
          <label className="label">Tag</label>
          <input
            className="input"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. react"
          />
        </div>

        <div className="flex items-end">
          <button onClick={apply} className="btn-primary w-full">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogFilters;

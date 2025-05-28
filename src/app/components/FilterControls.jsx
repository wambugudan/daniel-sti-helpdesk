'use client';

import React from 'react';

const FilterControls = ({
  status,
  setStatus,
  category,
  setCategory,
  sortBy,
  setSortBy,
  categories = [], // You can pass this in if you want dynamic options
}) => {
  const statusOptions = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'bids', label: 'Bid Count' },
  ];

  const defaultCategories = ['ALL', 'Design', 'Writing', 'Research', 'Development']; // fallback

  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          className="border rounded px-3 py-2 w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="border rounded px-3 py-2 w-40"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {(categories.length ? ['ALL', ...categories] : defaultCategories).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium mb-1">Sort By</label>
        <select
          className="border rounded px-3 py-2 w-40"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;

import React from 'react';
import { X } from 'lucide-react';
import { FilterState } from '../../types';

interface ActiveFilterTagsProps {
  filters: FilterState;
  onRemove: (category: keyof FilterState, value: string) => void;
  onClearAll: () => void;
}

const ActiveFilterTags: React.FC<ActiveFilterTagsProps> = ({ filters, onRemove, onClearAll }) => {
  const activeFilters = Object.entries(filters).flatMap(([category, values]) => 
    values.map(value => ({ category: category as keyof FilterState, value }))
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {activeFilters.map(({ category, value }) => (
        <button
          key={`${category}-${value}`}
          onClick={() => onRemove(category, value)}
          className="flex items-center gap-1 px-3 py-1 bg-zinc-100 text-zinc-700 text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors rounded-full"
        >
          {value}
          <X size={12} />
        </button>
      ))}
      <button 
        onClick={onClearAll}
        className="text-xs text-zinc-400 hover:text-black underline underline-offset-4 ml-2 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilterTags;

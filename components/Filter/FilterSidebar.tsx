import React from 'react';
import { FilterState } from '../../types';
import FilterSection from './FilterSection';
import CheckboxFilterItem from './CheckboxFilterItem';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, className = '' }) => {
  const handleFilterChange = (category: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [category]: newValues,
      };
    });
  };

  const clearAll = () => {
    setFilters({
      style: [],
      fabrics: [],
      type: [],
      stitchType: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  return (
    <aside className={`w-full bg-white ${className}`}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
        <h3 className="text-xl font-serif">Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearAll}
            className="text-sm text-zinc-500 hover:text-black transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        <FilterSection title="Style">
          <CheckboxFilterItem 
            label="Original Pakistani" 
            checked={filters.style.includes('Original Pakistani')} 
            onChange={() => handleFilterChange('style', 'Original Pakistani')}
          />
          <CheckboxFilterItem 
            label="Inspired Pakistani" 
            checked={filters.style.includes('Inspired Pakistani')} 
            onChange={() => handleFilterChange('style', 'Inspired Pakistani')}
          />
        </FilterSection>

        <FilterSection title="Fabrics">
          <CheckboxFilterItem 
            label="Organza" 
            checked={filters.fabrics.includes('Organza')} 
            onChange={() => handleFilterChange('fabrics', 'Organza')}
          />
          <CheckboxFilterItem 
            label="Chiffon" 
            checked={filters.fabrics.includes('Chiffon')} 
            onChange={() => handleFilterChange('fabrics', 'Chiffon')}
          />
          <CheckboxFilterItem 
            label="Cotton" 
            checked={filters.fabrics.includes('Cotton')} 
            onChange={() => handleFilterChange('fabrics', 'Cotton')}
          />
        </FilterSection>

        <FilterSection title="Type">
          <CheckboxFilterItem 
            label="Gown" 
            checked={filters.type.includes('Gown')} 
            onChange={() => handleFilterChange('type', 'Gown')}
          />
          <CheckboxFilterItem 
            label="Kamiz" 
            checked={filters.type.includes('Kamiz')} 
            onChange={() => handleFilterChange('type', 'Kamiz')}
          />
        </FilterSection>

        <FilterSection title="Stitch Type">
          <CheckboxFilterItem 
            label="Ready Made" 
            checked={filters.stitchType.includes('Ready Made')} 
            onChange={() => handleFilterChange('stitchType', 'Ready Made')}
          />
          <CheckboxFilterItem 
            label="Unstitched" 
            checked={filters.stitchType.includes('Unstitched')} 
            onChange={() => handleFilterChange('stitchType', 'Unstitched')}
          />
        </FilterSection>
      </div>
    </aside>
  );
};

export default FilterSidebar;

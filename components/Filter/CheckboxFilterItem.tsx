import React from 'react';

interface CheckboxFilterItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const CheckboxFilterItem: React.FC<CheckboxFilterItemProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          className="peer sr-only" 
          checked={checked} 
          onChange={onChange} 
        />
        <div className="w-5 h-5 border border-zinc-200 rounded-sm bg-white transition-colors peer-checked:bg-black peer-checked:border-black group-hover:border-zinc-400"></div>
        <svg 
          className="absolute w-3 h-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">
        {label}
      </span>
    </label>
  );
};

export default CheckboxFilterItem;

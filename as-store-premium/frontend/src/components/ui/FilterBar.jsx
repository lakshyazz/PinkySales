import React from 'react';
import { motion } from 'framer-motion';

export default function FilterBar({
  options = [],
  activeOption,
  onChange,
  label,
  className = '',
}) {
  return (
    <div className={`filter-bar flex items-center gap-3 py-1.5 overflow-x-auto no-scrollbar ${className}`.trim()}>
      {label && <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 select-none shrink-0">{label}</span>}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/40 shrink-0">
        {options.map((option) => {
          const isSelected = option.value === activeOption;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors select-none ${
                isSelected 
                  ? 'text-slate-800' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeFilterPillBackground"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
}) {
  return (
    <div className={`searchbox relative flex items-center ${className}`.trim()}>
      <Search className="text-slate-400 shrink-0" size={18} />
      <input
        aria-label={ariaLabel || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value, event)}
        className="w-full bg-transparent border-0 outline-none pl-2 pr-8 text-sm placeholder-slate-400"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            type="button"
            className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            onClick={(e) => onChange('', e)}
          >
            <X size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

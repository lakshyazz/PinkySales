import React from 'react';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ title, description }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="empty flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Package size={22} />
      </div>
      <span className="text-sm font-bold text-slate-700 block">{title}</span>
      {description && <small className="text-xs text-slate-400 mt-1 block">{description}</small>}
    </motion.div>
  );
}

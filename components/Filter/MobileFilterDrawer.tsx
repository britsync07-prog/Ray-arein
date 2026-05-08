import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import { FilterState } from '../../types';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({ isOpen, onClose, filters, setFilters }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif">Filters</h2>
                <button 
                  onClick={onClose}
                  className="p-2 -mr-2 text-zinc-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
              />

              <div className="mt-12">
                <button
                  onClick={onClose}
                  className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  Show Results
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterDrawer;

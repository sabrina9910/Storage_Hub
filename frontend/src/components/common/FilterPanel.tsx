import { useState, useRef, useEffect } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterGroup {
  id: string;
  label: string;
  options: { value: string; label: string; hidden?: boolean }[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string>;
  onFilterChange: (groupId: string, value: string) => void;
  onReset: () => void;
}

export default function FilterPanel({ groups, activeFilters, onFilterChange, onReset }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Count active filters, ignoring default values
  const activeCount = Object.keys(activeFilters).filter(k => 
    activeFilters[k] !== '' && 
    activeFilters[k] !== 'ALL' && 
    activeFilters[k] !== 'all' && 
    activeFilters[k] !== undefined
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm relative active:scale-95 border",
          isOpen || activeCount > 0
            ? "bg-slate-800 border-slate-700 text-white shadow-lg shadow-slate-900/20" 
            : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
        )}
      >
        <Filter size={18} />
        <span className="hidden sm:inline">Filtri</span>
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm animate-in zoom-in">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100/80">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Filter size={16} className="text-primary" /> Filtri Ricerca
            </h3>
            {activeCount > 0 && (
              <button 
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
              >
                Resetta
              </button>
            )}
          </div>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {groups.map(group => {
              const visibleOptions = group.options.filter(o => !o.hidden);
              if (visibleOptions.length === 0) return null;

              return (
                <div key={group.id}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{group.label}</label>
                  <div className="space-y-1">
                    {visibleOptions.map(option => {
                      const isActive = activeFilters[group.id] === option.value || (option.value === 'ALL' && !activeFilters[group.id]) || (option.value === 'all' && !activeFilters[group.id]);
                      return (
                        <button
                          key={option.value}
                          onClick={() => onFilterChange(group.id, option.value)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 group",
                            isActive 
                              ? "bg-primary/10 text-primary shadow-sm" 
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {option.label}
                          {isActive && <Check size={16} className="animate-in zoom-in" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

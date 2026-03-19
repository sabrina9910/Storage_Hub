import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export default function SearchBar({ value, onChange, placeholder = "Cerca...", isSearching = false }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} className="text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold text-slate-700 transition-all shadow-sm placeholder:font-medium placeholder:text-slate-400"
      />
      {isSearching && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Loader2 size={16} className="text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}

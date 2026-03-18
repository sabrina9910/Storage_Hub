import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export default function Keypad({ value, onChange, onSubmit, submitLabel = "Confirm" }: KeypadProps) {
  const handlePress = (key: string) => {
    if (value === '0' && key !== '.') {
      onChange(key);
    } else if (value.includes('.') && key === '.') {
      return;
    } else {
      onChange(value + key);
    }
  };

  const handleDelete = () => {
    if (value.length > 1) {
      onChange(value.slice(0, -1));
    } else {
      onChange('');
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="w-full max-w-sm mx-auto p-4 glass-card shadow-xl shadow-slate-200/50">
      <div className="bg-white/50 rounded-xl p-4 mb-4 text-right overflow-hidden shadow-inner border border-white/50">
        <span className="text-4xl font-bold tracking-tight text-slate-800">
          {value || '0'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className="h-16 rounded-xl bg-white/60 hover:bg-white active:scale-95 transition-all text-2xl font-bold text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center pointer-events-auto"
          >
            {key}
          </button>
        ))}
        <button
          onClick={handleDelete}
          className="h-16 rounded-xl bg-error/10 hover:bg-error/20 active:scale-95 transition-all text-error flex items-center justify-center border border-error/20"
        >
          <Delete size={28} />
        </button>
      </div>

      <button
        onClick={onSubmit}
        disabled={!value || value === '0' || value === '.'}
        className={cn(
          "w-full h-16 rounded-xl mt-4 text-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg flex items-center justify-center",
          value && value !== '0' && value !== '.'
            ? "bg-primary shadow-primary/30 hover:bg-primary-dark"
            : "bg-slate-300 shadow-none cursor-not-allowed text-slate-100"
        )}
      >
        {submitLabel}
      </button>
    </div>
  );
}

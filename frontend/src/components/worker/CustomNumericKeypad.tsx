import React from 'react';
import { Delete } from 'lucide-react';

interface CustomNumericKeypadProps {
  value: string;
  onChange: (newValue: string) => void;
  maxLength?: number;
}

export default function CustomNumericKeypad({ value, onChange, maxLength = 6 }: CustomNumericKeypadProps) {
  const handleKeyPress = (key: string) => {
    if (value.length < maxLength) {
      // Prevent multiple leading zeros
      if (value === '0' && key === '0') return;
      // Replace initial 0 if another number is pressed
      if (value === '0' && key !== '0') {
        onChange(key);
      } else {
        onChange(value + key);
      }
    }
  };

  const handleDelete = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const buttonClass = "h-14 bg-white/70 hover:bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-2xl font-semibold text-slate-800 transition-all active:scale-95 active:bg-slate-100 touch-manipulation";
  const actionButtonClass = "h-14 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center font-bold text-slate-600 transition-all active:scale-95 touch-manipulation";

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-4 glass-card bg-slate-50/50">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          type="button"
          className={buttonClass}
          onClick={() => handleKeyPress(num.toString())}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        className={actionButtonClass}
        onClick={handleClear}
      >
        C
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => handleKeyPress('0')}
      >
        0
      </button>
      <button
        type="button"
        className={actionButtonClass}
        onClick={handleDelete}
      >
        <Delete className="w-6 h-6" />
      </button>
    </div>
  );
}

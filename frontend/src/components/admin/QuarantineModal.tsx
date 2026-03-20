import { ShieldAlert, X, Loader2 } from 'lucide-react';

interface QuarantineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function QuarantineModal({ isOpen, onClose, onConfirm, isPending }: QuarantineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center border-4 border-white shadow-sm">
              <ShieldAlert size={32} className="text-rose-600" />
            </div>
            <button 
              onClick={onClose} 
              disabled={isPending}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Conferma Quarantena</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            Attenzione: spostare questo elemento in Quarantena bloccherà immediatamente tutte le operazioni di uscita. Vuoi procedere?
          </p>
        </div>
        
        <div className="p-6 md:p-8 bg-slate-50/80 border-t border-slate-100/50 flex gap-3 justify-end items-center">
          <button 
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50 active:scale-95"
          >
            Annulla
          </button>
          <button 
            onClick={onConfirm}
            disabled={isPending}
            className="px-6 py-3 font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/30 rounded-xl transition-all flex items-center justify-center min-w-[190px] disabled:opacity-70 active:scale-95"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Elaborazione...
              </>
            ) : (
              'Conferma Quarantena'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

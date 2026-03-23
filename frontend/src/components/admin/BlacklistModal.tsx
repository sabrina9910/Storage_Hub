import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface BlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export default function BlacklistModal({ isOpen, onClose, onConfirm, isPending }: BlacklistModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-full">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Metti in Blacklist</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm rounded-full transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-sm text-rose-800 font-medium">
            <strong>Attenzione:</strong> Questo prodotto verrà rimosso dal catalogo e non sarà più visibile nelle viste standard.
            Potrà essere ripristinato dalla sezione Blacklist.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Motivo (opzionale)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
              rows={4}
              placeholder="Descrivi il motivo della blacklist..."
              disabled={isPending}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Elaborazione...
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  Conferma Blacklist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

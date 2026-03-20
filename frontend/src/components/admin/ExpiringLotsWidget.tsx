import { AlertCircle, Tag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function ExpiringLotsWidget({ lots }: { lots: any[] }) {
  // Filter for next 15 days
  const today = new Date();
  const next15Days = new Date(today);
  next15Days.setDate(today.getDate() + 15);

  const expiringLots = lots
    .filter(lot => {
      const expDate = new Date(lot.expiration_date);
      return expDate >= today && expDate <= next15Days;
    })
    .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

  const handleDiscount = (lotId: string) => {
    toast.success('Lotto in sconto promozionale. (Mock)', { icon: '🏷️' });
  };

  const handleWaste = (lotId: string) => {
    toast.error('Movimento OUT (Scarto) registrato. (Mock)', { icon: '🗑️' });
  };

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden relative border border-white/60">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>

      <div className="p-6 pb-4 border-b border-white/40 bg-white/30 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20 rounded-xl">
              <AlertCircle size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Azioni FIFO</h3>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">{expiringLots.length} lotti in scadenza a breve</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10 bg-white/10">
        {expiringLots.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center h-full">
            <p className="font-semibold text-sm">Nessun lotto in scadenza a breve.</p>
            <p className="text-xs mt-1">Stato inventario ottimale.</p>
          </div>
        ) : (
          expiringLots.map((lot) => {
             const daysDiff = Math.ceil((new Date(lot.expiration_date).getTime() - today.getTime()) / (1000 * 3600 * 24));
             const isUrgent = daysDiff <= 5;

               return (
                <div 
                  key={lot.id} 
                  className={cn(
                    "p-5 rounded-2xl border relative group transition-all duration-300 shadow-sm",
                    isUrgent ? "bg-white border-amber-200 hover:border-amber-400 hover:shadow-md" : "bg-white/80 border-slate-100/50 hover:bg-white"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full",
                        isUrgent ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm" : "bg-slate-200 text-slate-600"
                      )}>
                        Tra {daysDiff} giorni
                      </span>
                      <h4 className="font-bold text-slate-800 mt-2 text-lg line-clamp-1" title={lot.product_name || `Lotto ${lot.lot_number}`}>
                        {lot.product_name || 'Prodotto'}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 rounded">{lot.lot_number}</span>
                        <span className="text-xs font-black text-rose-500">{lot.current_quantity} in stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDiscount(lot.id)}
                      className="flex-1 py-2 px-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Tag size={16} /> Sposta al Fronte / Sconta
                    </button>
                    <button 
                      onClick={() => handleWaste(lot.id)}
                      className="py-2 px-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center active:scale-95 group-hover:opacity-100 opacity-70"
                      title="Scarta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/40 bg-white/30 backdrop-blur-md">
          <Link to="/admin/at-risk-lots" className="w-full py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl hover:text-amber-600 hover:border-amber-500/50 hover:shadow-sm transition-all flex items-center justify-center gap-2 group">
            Visualizza tutti i lotti a rischio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
    </div>
  );
}

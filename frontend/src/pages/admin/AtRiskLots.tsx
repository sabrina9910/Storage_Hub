import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, CalendarClock } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface SupplyLot {
  id: number;
  lot_number: string;
  product_name?: string;
  product_sku?: string;
  product?: { name: string; sku: string };
  current_quantity: number;
  expiration_date: string;
}

const fetchAtRiskLots = async (): Promise<SupplyLot[]> => {
  return await fetchApi('/lots/');
};

export default function AtRiskLots() {
  const { data: lots, isLoading, isError } = useQuery({
    queryKey: ['at-risk-lots'],
    queryFn: fetchAtRiskLots,
  });

  const today = new Date();
  
  // Filter lots that expire within the next 30 days or are already expired.
  // Sort by expiration date (most urgent first)
  const atRiskLots = lots?.filter(lot => {
    if (!lot.expiration_date) return false;
    const expDate = new Date(lot.expiration_date);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 30; // 30 days or less (including < 0 which is expired)
  }).sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/dashboard" 
          className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-xl shadow-sm transition-all text-slate-700 hover:text-slate-900 font-medium"
        >
          <ArrowLeft size={18} />
          Torna alla Dashboard
        </Link>
      </div>

      <div className="glass-card p-8 min-h-[60vh] rounded-3xl bg-white/60 backdrop-blur-xl border border-rose-500/20 shadow-[0_8px_30px_rgb(225,29,72,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 border border-rose-500/20 shadow-inner">
              <CalendarClock size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lotti a Rischio</h1>
              <p className="text-slate-500 font-medium mt-1">Lotti in scadenza nei prossimi 30 giorni o già scaduti.</p>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-md border border-rose-200 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3">
             <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Lotti Critici</span>
                <span className="text-xl font-black text-slate-700">{atRiskLots.length}</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xl border border-rose-200">
               {atRiskLots.length}
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-white/40 animate-pulse rounded-2xl border border-white/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-rose-500 bg-white/30 rounded-2xl border border-rose-200 border-dashed">
            <AlertCircle size={48} className="mb-4 opacity-50 animate-pulse" />
            <p className="font-semibold text-xl text-slate-800">Errore nel caricamento dei dati</p>
            <p className="text-sm text-slate-500 mt-2">Impossibile recuperare i lotti dall'API.</p>
          </div>
        ) : atRiskLots.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white/30 rounded-2xl border border-emerald-200 border-dashed">
            <CalendarClock size={48} className="mx-auto mb-4 text-emerald-500 opacity-60" />
            <p className="font-bold text-xl text-emerald-700">Situazione Ottimale</p>
            <p className="text-sm text-emerald-600/80 mt-2">Non ci sono lotti in scadenza a breve nel database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {atRiskLots.map((lot) => {
              const expDate = new Date(lot.expiration_date);
              const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const isExpired = daysDiff < 0;
              const isCritical = daysDiff >= 0 && daysDiff <= 7;
              
              const productName = lot.product_name || lot.product?.name || 'Prodotto Sconosciuto';
              const productSku = lot.product_sku || lot.product?.sku || 'SKU N/A';
              
              return (
                <div key={lot.id} className={`p-6 bg-white/60 backdrop-blur-sm border shadow-sm rounded-2xl transition-all duration-300 flex flex-col justify-between group ${isExpired ? 'border-rose-400 bg-rose-50/50 shadow-rose-500/10 hover:shadow-rose-500/20' : isCritical ? 'border-amber-400 bg-amber-50/50 shadow-amber-500/10 hover:shadow-amber-500/20' : 'border-rose-200/60 hover:shadow-md hover:bg-white/80'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-white/80 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200/60 shadow-sm">
                        Lotto {lot.lot_number}
                      </span>
                      {isExpired ? (
                        <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm animate-pulse">
                          Scaduto
                        </span>
                      ) : (
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm ${isCritical ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-rose-100/80 text-rose-700 border border-rose-200/50'}`}>
                          {daysDiff === 0 ? 'Scade Oggi' : `Tra ${daysDiff} giorni`}
                        </span>
                      )}
                    </div>
                     <h3 className="font-bold text-slate-800 text-xl leading-tight mb-1 group-hover:text-primary transition-colors">
                      {productName}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-slate-400 mb-5">{productSku}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/50 border border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Data Scadenza</p>
                        <p className={`font-bold text-sm ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>{expDate.toLocaleDateString('it-IT')}</p>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-4">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Giacenza</p>
                        <p className={`font-black tracking-tight text-lg ${lot.current_quantity < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {lot.current_quantity} <span className="text-xs font-semibold text-slate-400">pz</span>
                        </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

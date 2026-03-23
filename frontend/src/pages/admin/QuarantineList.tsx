import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShieldAlert, AlertCircle } from 'lucide-react';
import { apiServices } from '@/lib/api';

export default function QuarantineList() {
  const { data: products, isLoading: pLoading, isError: pError } = useQuery({ queryKey:['products'], queryFn: apiServices.getProducts });
  const { data: lotsData, isLoading: lLoading, isError: lError } = useQuery({ queryKey:['lots'], queryFn: apiServices.getLots });
  const { data: movements, isLoading: mLoading, isError: mError } = useQuery({ queryKey:['movements'], queryFn: apiServices.getMovements });

  const isLoading = pLoading || lLoading || mLoading;
  const isError = pError || lError || mError;

  const safeProducts = Array.isArray(products?.results || products) ? (products?.results || products) : [];
  const safeLots = Array.isArray(lotsData?.results || lotsData) ? (lotsData?.results || lotsData) : [];
  const safeMovements = Array.isArray(movements?.results || movements) ? (movements?.results || movements) : [];

  // Find all lot IDs that have been quarantined at least once
  const quarantinedLotIds = new Set(safeMovements.filter((m:any) => m.movement_type === 'QUARANTINE').map((m:any) => m.lot));

  const lots = safeLots.filter((l:any) => quarantinedLotIds.has(l.id)).map((l:any) => {
    const prod = safeProducts.find((p:any) => p.id === l.product);
    // Find the latest quarantine movement for notes/date
    const qMoves = safeMovements.filter((m:any) => m.lot === l.id && m.movement_type === 'QUARANTINE').sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestMove = qMoves[0];
    
    return {
      id: l.id,
      lot_number: l.lot_number,
      quantity: l.current_quantity,
      product: prod || { id: l.product, name: 'Sconosciuto', sku: 'N/A' },
      status: 'QUARANTINE',
      notes: latestMove?.notes || 'Stato quarantena attivato dal sistema',
      created_at: latestMove?.timestamp || new Date().toISOString()
    };
  });

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
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 border border-rose-500/20">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Articoli in Quarantena</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/40 animate-pulse rounded-2xl border border-white/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="font-semibold text-lg">Errore nel caricamento dei dati di quarantena</p>
          </div>
        ) : lots?.length === 0 ? (
          <div className="text-center py-12 text-emerald-600">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Nessun articolo in quarantena al momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots?.map((lot: any) => (
              <div key={lot.id} className="p-6 bg-white/50 backdrop-blur-sm border border-rose-200 shadow-sm rounded-2xl hover:shadow-md hover:bg-white/80 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider rounded-lg border border-rose-200">
                      Lotto: {lot.lot_number}
                    </span>
                    <span className="text-xl font-black text-rose-600">{lot.quantity} pz</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{lot.product.name}</h3>
                  <p className="text-sm font-mono text-slate-500 mb-4">{lot.product.sku}</p>
                </div>
                <div className="pt-4 border-t border-rose-100">
                  <p className="text-sm text-slate-600 italic">"{lot.notes || 'Nessuna nota specificata'}"</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Registrato: {new Date(lot.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

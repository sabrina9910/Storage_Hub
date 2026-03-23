import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ShieldAlert, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import { apiServices } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function QuarantineList() {
  const queryClient = useQueryClient();
  const { data: products, isLoading: pLoading, isError: pError } = useQuery({ queryKey:['products'], queryFn: apiServices.getProducts });
  const { data: lotsData, isLoading: lLoading, isError: lError } = useQuery({ queryKey:['lots'], queryFn: apiServices.getLots });

  const restoreMutation = useMutation({
    mutationFn: (productId: string | number) => apiServices.restoreQuarantineProduct(productId),
    onSuccess: () => {
      toast.success('Prodotto rimosso dalla quarantena');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante il ripristino');
    }
  });

  const isLoading = pLoading || lLoading;
  const isError = pError || lError;

  const safeProducts = Array.isArray(products?.results || products) ? (products?.results || products) : [];
  const safeLots = Array.isArray(lotsData?.results || lotsData) ? (lotsData?.results || lotsData) : [];

  const productsInQuarantine = safeProducts.filter((p: any) => p.is_quarantined).map((product: any) => {
    // Calculate total quantity across all lots for this product
    const productLots = safeLots.filter((l: any) => l.product === product.id);
    const totalQty = productLots.reduce((acc: number, lot: any) => acc + lot.current_quantity, 0);
    
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: totalQty,
      notes: product.quarantine_reason || 'Nessuna nota',
      created_at: product.quarantined_at || new Date().toISOString()
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
        ) : productsInQuarantine?.length === 0 ? (
          <div className="text-center py-12 text-emerald-600">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Nessun articolo in quarantena al momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsInQuarantine?.map((item: any) => (
              <div key={item.id} className="p-6 bg-white/50 backdrop-blur-sm border border-rose-200 shadow-sm rounded-2xl hover:shadow-md hover:bg-white/80 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider rounded-lg border border-rose-200">
                      Prodotto
                    </span>
                    <span className="text-xl font-black text-rose-600">{item.quantity} pz</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.name}</h3>
                  <p className="text-sm font-mono text-slate-500 mb-4">{item.sku}</p>
                </div>
                <div className="pt-4 border-t border-rose-100 space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 italic">"{item.notes}"</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">Registrato: {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => restoreMutation.mutate(item.id)}
                    disabled={restoreMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {restoreMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                    Ripristina Prodotto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

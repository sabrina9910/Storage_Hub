import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Package, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function Blacklist() {
  const queryClient = useQueryClient();

  const { data: blacklistedProducts, isLoading } = useQuery({
    queryKey: ['blacklistedProducts'],
    queryFn: apiServices.getBlacklistedProducts,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiServices.restoreProduct(id),
    onSuccess: () => {
      toast.success('Prodotto ripristinato con successo!');
      queryClient.invalidateQueries({ queryKey: ['blacklistedProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante il ripristino');
    },
  });

  const handleRestore = (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler ripristinare "${name}"?`)) {
      restoreMutation.mutate(id);
    }
  };

  const productsList = Array.isArray(blacklistedProducts?.results) 
    ? blacklistedProducts.results 
    : (Array.isArray(blacklistedProducts) ? blacklistedProducts : []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Prodotti in Blacklist</h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestisci i prodotti rimossi dalla circolazione
          </p>
        </div>
        <div className="px-4 py-2 bg-rose-100 border border-rose-200 rounded-xl">
          <span className="text-rose-700 font-black text-2xl">{productsList.length}</span>
          <span className="text-rose-600 font-medium text-sm ml-2">prodotti</span>
        </div>
      </div>

      {productsList.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Nessun Prodotto in Blacklist</h2>
          <p className="text-slate-500 font-medium">
            Tutti i prodotti sono attualmente disponibili nel catalogo.
          </p>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl">
          <div className="space-y-4">
            {productsList.map((product: any) => (
              <div
                key={product.id}
                className="bg-white border-2 border-rose-200 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-widest rounded-lg">
                        {product.sku}
                      </span>
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                        <AlertTriangle size={14} /> Blacklist
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                      {product.name}
                    </h3>
                    
                    {product.blacklist_reason && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-3">
                        <p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-1">
                          Motivo Blacklist
                        </p>
                        <p className="text-sm text-slate-700 font-medium">
                          {product.blacklist_reason}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-slate-500 font-medium">Categoria:</span>
                        <span className="ml-2 font-bold text-slate-800">
                          {product.category_name || product.category?.name || 'N/D'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Prezzo:</span>
                        <span className="ml-2 font-bold text-slate-800">
                          €{product.unit_price}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Unità:</span>
                        <span className="ml-2 font-bold text-slate-800 uppercase">
                          {product.unit_of_measure || 'PZ'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRestore(product.id, product.name)}
                    disabled={restoreMutation.isPending}
                    className={cn(
                      "px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {restoreMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <RotateCcw size={20} />
                        Ripristina
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { ShieldAlert, RotateCcw, Loader2, User, Calendar, MessageSquare, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function QuarantineWidget() {
  const queryClient = useQueryClient();

  const { data: quarantinedProducts, isLoading } = useQuery({
    queryKey: ['products', 'quarantined'],
    queryFn: () => apiServices.getProducts({ is_quarantined: true }),
    refetchInterval: 30000, // Light polling every 30s as requested
  });

  const restoreMutation = useMutation({
    mutationFn: (productId: string | number) => apiServices.restoreQuarantineProduct(productId),
    onSuccess: () => {
      toast.success('Prodotto rimosso dalla quarantena');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante il ripristino dalla quarantena');
    }
  });

  const handleRestore = (id: string | number) => {
    restoreMutation.mutate(id);
  };

  const productsList = Array.isArray(quarantinedProducts?.results) 
    ? quarantinedProducts.results 
    : (Array.isArray(quarantinedProducts) ? quarantinedProducts : []);

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-3xl flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-rose-100 shadow-[0_8px_30px_rgb(225,29,72,0.03)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 border-b border-rose-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 border border-rose-500/20">
            <ShieldAlert size={22} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Articoli in Quarantena</h2>
        </div>
        <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg text-sm border border-rose-100">
          {productsList.length} articoli
        </span>
      </div>

      {productsList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
            <Package size={32} className="text-emerald-500/60" />
          </div>
          <p className="font-bold text-slate-400">Nessun articolo in quarantena.</p>
          <p className="text-xs text-slate-300 uppercase tracking-widest font-black mt-1">Stato Operativo Nominale</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-2 custom-scrollbar">
          {productsList.map((product: any) => (
            <div 
              key={product.id} 
              className="bg-white/80 border border-rose-100 rounded-2xl p-5 hover:bg-white transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200">
                         {product.sku}
                       </span>
                    </div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Calendar size={14} className="text-slate-400" />
                      <span>
                        {product.quarantined_at ? 
                          format(new Date(product.quarantined_at), "d MMM yyyy, HH:mm", { locale: it }) : 
                          'Data N/D'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <User size={14} className="text-slate-400" />
                      <span className="line-clamp-1">
                        {product.quarantined_by_detail ? 
                          `${product.quarantined_by_detail.first_name} ${product.quarantined_by_detail.last_name || ''}`.trim() || product.quarantined_by_detail.email : 
                          'Utente N/D'}
                      </span>
                    </div>
                  </div>

                  {product.quarantine_reason && (
                    <div className="flex items-start gap-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                      <MessageSquare size={14} className="text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-700/80 font-medium leading-relaxed italic">
                        {product.quarantine_reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:border-l border-rose-100 md:pl-6 shrink-0">
                  <button
                    onClick={() => handleRestore(product.id)}
                    disabled={restoreMutation.isPending}
                    className="w-full md:w-auto px-5 py-3 bg-white hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {restoreMutation.isPending && restoreMutation.variables === product.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RotateCcw size={16} />
                    )}
                    Rimuovi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

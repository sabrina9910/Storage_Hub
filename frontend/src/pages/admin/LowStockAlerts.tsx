import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, AlertCircle } from 'lucide-react';
import { apiServices } from '@/lib/api';

export default function LowStockAlerts() {
  const { data: products, isLoading: pLoading, isError: pError } = useQuery({ queryKey:['products'], queryFn: apiServices.getProducts });
  const { data: lots, isLoading: lLoading, isError: lError } = useQuery({ queryKey:['lots'], queryFn: apiServices.getLots });

  const isLoading = pLoading || lLoading;
  const isError = pError || lError;

  const safeProducts = Array.isArray(products?.results || products) ? (products?.results || products) : [];
  const safeLots = Array.isArray(lots?.results || lots) ? (lots?.results || lots) : [];

  const alerts = safeProducts.map((p:any) => {
    const totalQty = safeLots.filter((l:any) => l.product === p.id).reduce((acc:number, cur:any) => acc + cur.current_quantity, 0);
    return {
      product_id: p.id,
      name: p.name,
      sku: p.sku,
      min_stock_level: p.min_stock_threshold,
      total_quantity: totalQty,
      deficit: p.min_stock_threshold - totalQty
    };
  }).filter((a: any) => a.total_quantity < a.min_stock_level && a.min_stock_level > 0);

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

      <div className="glass-card p-8 min-h-[60vh] rounded-3xl bg-white/60 backdrop-blur-xl border border-amber-500/20 shadow-[0_8px_30px_rgb(245,158,11,0.04)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 border border-amber-500/20">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Allarmi Scorte</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/40 animate-pulse rounded-2xl border border-white/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-amber-500">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="font-semibold text-lg">Errore nel caricamento degli allarmi</p>
          </div>
        ) : alerts?.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-30 text-emerald-500" />
            <p className="font-medium text-lg text-emerald-600">Nessun allarme sottoscorta. L'inventario è in salute!</p>
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-amber-200/50 overflow-hidden shadow-inner flex flex-col">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/50 border-b border-white/60 text-amber-700 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Prodotto</th>
                  <th className="p-4 font-bold text-center">SKU</th>
                  <th className="p-4 font-bold text-right">Q.tà Attuale</th>
                  <th className="p-4 font-bold text-right">Soglia Minima</th>
                  <th className="p-4 font-bold text-right">Deficit</th>
                </tr>
              </thead>
              <tbody>
                {alerts?.map((alert: any, idx: number) => (
                  <tr key={idx} className="border-b border-amber-100 last:border-0 hover:bg-white/60 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{alert.name}</td>
                    <td className="p-4 font-mono text-sm font-semibold text-slate-500 text-center">{alert.sku}</td>
                    <td className="p-4 text-rose-600 font-bold text-right">{alert.total_quantity}</td>
                    <td className="p-4 text-slate-600 font-medium text-right">{alert.min_stock_level}</td>
                    <td className="p-4 text-rose-600 font-black text-right">-{alert.deficit || (alert.min_stock_level - alert.total_quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface ActiveProduct {
  id: string | number;
  sku: string;
  name: string;
  category: { id: number; name: string } | null;
  supplier: { id: number; name: string } | null;
  min_stock_level: number;
  is_active: boolean;
}

const fetchActiveProducts = async (): Promise<ActiveProduct[]> => {
  const res = await fetchApi('/products/?is_active=True');
  return Array.isArray(res?.results) ? res.results : (Array.isArray(res) ? res : []);
};

export default function ActiveProductsList() {
  const { data: products, isLoading: pLoading, isError: pError } = useQuery({
    queryKey: ['active-products'],
    queryFn: fetchActiveProducts,
  });
  
  const { data: categories } = useQuery({ queryKey:['categories'], queryFn: () => fetchApi('/categories/') });
  const { data: suppliers } = useQuery({ queryKey:['suppliers'], queryFn: () => fetchApi('/suppliers/') });

  const safeCats = Array.isArray(categories?.results || categories) ? (categories?.results || categories) : [];
  const safeSupp = Array.isArray(suppliers?.results || suppliers) ? (suppliers?.results || suppliers) : [];
  
  const categoryMap = new Map(safeCats.map((c: any) => [c.id, c.name]));
  const supplierMap = new Map(safeSupp.map((s: any) => [s.id, s.name]));

  const enrichedProducts = (products as any[] || []).map((p: any) => ({
    ...p,
    catName: String(categoryMap.get((p.category as any)?.id || p.category) || 'N/D'),
    suppName: String(supplierMap.get((p.supplier as any)?.id || p.supplier) || 'N/D')
  }));

  const isLoading = pLoading;
  const isError = pError;

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

      <div className="glass-card p-8 min-h-[60vh] rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 border border-blue-500/20">
            <Package size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Prodotti Attivi</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/40 animate-pulse rounded-2xl border border-white/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="font-semibold text-lg">Errore nel caricamento dei prodotti</p>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Nessun prodotto attivo trovato.</p>
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-white/60 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold">Nome</th>
                  <th className="p-4 font-bold">Categoria</th>
                  <th className="p-4 font-bold">Fornitore</th>
                  <th className="p-4 font-bold">Min Stock</th>
                </tr>
              </thead>
              <tbody>
                {enrichedProducts?.map((product: any) => (
                  <tr key={product.id} className="border-b border-white/40 last:border-0 hover:bg-white/60 transition-colors">
                    <td className="p-4 font-mono text-sm font-semibold text-slate-700">{product.sku}</td>
                    <td className="p-4 font-semibold text-slate-800">{product.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{product.catName}</td>
                    <td className="p-4 text-slate-600 font-medium">{product.suppName}</td>
                    <td className="p-4 text-rose-600 font-black">{product.min_stock_level}</td>
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

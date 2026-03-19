import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Clock, ShieldAlert, FileText, Layers, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { apiServices } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading: pLoading, isError: pError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiServices.getProductById(id as string),
    enabled: !!id,
  });

  const { data: movements, isLoading: mLoading } = useQuery({
    queryKey: ['movements', id],
    queryFn: () => apiServices.getProductMovements(id as string),
    enabled: !!id,
  });

  const { data: lots, isLoading: lLoading } = useQuery({
    queryKey: ['lots'],
    queryFn: apiServices.getLots,
  });

  if (pLoading || mLoading || lLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="h-10 w-48 bg-white/40 animate-pulse rounded-xl"></div>
        <div className="h-40 bg-white/40 animate-pulse rounded-3xl border border-white/50"></div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
             <div className="h-80 bg-white/40 animate-pulse rounded-3xl border border-white/50"></div>
             <div className="h-80 bg-white/40 animate-pulse rounded-3xl border border-white/50"></div>
          </div>
          <div className="h-96 bg-white/40 animate-pulse rounded-3xl border border-white/50"></div>
        </div>
      </div>
    );
  }

  if (pError || !product) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-md rounded-3xl border border-rose-200 min-h-[50vh] shadow-sm">
        <div className="p-4 bg-rose-100 rounded-full mb-4">
           <AlertCircle size={48} className="text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-rose-800 tracking-tight">Prodotto Non Trovato</h2>
        <p className="text-rose-600/80 mt-2 font-medium">L'ID specificato non esiste o c'è stato un problema di connessione.</p>
        <Link to="/admin/products" className="mt-8 px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:text-primary transition-all border border-slate-200">
          Torna al Catalogo
        </Link>
      </div>
    );
  }

  // Calculate totals and mappings
  const activeLots = Array.isArray(lots?.results || lots) ? (lots?.results || lots) : [];
  const productLots = activeLots.filter((l: any) => l.product === product.id || l.product_id === product.id);
  const totalStock = productLots.reduce((sum: number, l: any) => sum + (l.current_quantity || 0), 0);

  const rawMovements = Array.isArray(movements?.results || movements) ? (movements?.results || movements) : [];
  const productMovements = [...rawMovements].sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/products" 
          className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-xl shadow-sm transition-all text-slate-700 hover:text-slate-900 font-medium"
        >
          <ArrowLeft size={18} />
          Torna al Catalogo
        </Link>
      </div>

      {/* Header Top */}
      <div className="glass-card p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-indigo-500/20 shadow-[0_8px_30px_rgb(99,102,241,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                <Package size={48} />
             </div>
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 bg-white/80 border border-slate-200 shadow-sm text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{product.sku}</span>
                 {!product.is_active && <span className="px-3 py-1 bg-rose-100/80 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Inattivo</span>}
               </div>
               <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">{product.name}</h1>
               <div className="flex flex-wrap items-center gap-5 mt-3 text-slate-600 font-medium text-sm">
                 <span className="flex items-center gap-2 bg-slate-100/50 px-3 py-1 rounded-lg border border-slate-200/50">
                    <Layers size={16} className="text-indigo-500"/> {product.category_name || product.category?.name || 'Categoria N/D'}
                 </span>
                 <span className="flex items-center gap-2 bg-slate-100/50 px-3 py-1 rounded-lg border border-slate-200/50">
                    <FileText size={16} className="text-emerald-500"/> {product.unit_of_measure?.toUpperCase() || 'PZ'}
                 </span>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Lotti Attivi */}
          <div className="glass-card p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
             <div className="flex items-center justify-between mb-8 border-b border-slate-200/60 pb-4">
               <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 border border-blue-500/20">
                   <Layers size={22} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800">Lotti Attivi</h2>
               </div>
               <span className="font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg text-sm">{productLots.length} lotti</span>
             </div>
             
             {productLots.length === 0 ? (
               <div className="p-10 text-center text-slate-500 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                 <Layers size={48} className="mx-auto mb-4 opacity-30 text-slate-400" />
                 <p className="font-semibold text-lg">Nessun lotto attivo al momento.</p>
               </div>
             ) : (
               <div className="bg-white/70 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                       <tr>
                         <th className="px-6 py-4">Codice Lotto</th>
                         <th className="px-6 py-4 text-center">Scadenza</th>
                         <th className="px-6 py-4 text-right">Giacenza</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {productLots.map((lot: any) => {
                         const daysToExpiry = Math.ceil((new Date(lot.expiration_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                         return (
                           <tr key={lot.id} className="hover:bg-white/90 transition-colors group">
                             <td className="px-6 py-4 font-mono font-bold text-slate-700 group-hover:text-primary transition-colors">
                               {lot.lot_number}
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={cn("px-3 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase shadow-sm border", 
                                  daysToExpiry < 0 ? "bg-rose-50 text-rose-700 border-rose-200" :
                                  daysToExpiry <= 15 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-slate-600 border-slate-200"
                                )}>
                                  {new Date(lot.expiration_date).toLocaleDateString()}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right font-black text-indigo-600 text-lg">
                               {lot.current_quantity} <span className="text-xs text-slate-400 font-medium ml-1 uppercase">{product.unit_of_measure || 'PZ'}</span>
                             </td>
                           </tr>
                         );
                       })}
                    </tbody>
                  </table>
               </div>
             )}
          </div>

          {/* Storico Movimenti */}
          <div className="glass-card p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
             <div className="flex items-center justify-between mb-8 border-b border-slate-200/60 pb-4">
               <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
                   <Clock size={22} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800">Storico Movimenti</h2>
               </div>
               <span className="font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg text-sm">{productMovements.length} transazioni</span>
             </div>
             
             {productMovements.length === 0 ? (
               <div className="p-10 text-center text-slate-500 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                 <Clock size={48} className="mx-auto mb-4 opacity-30 text-slate-400" />
                 <p className="font-semibold text-lg">Nessun movimento registrato.</p>
               </div>
             ) : (
               <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[33px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {productMovements.map((mov: any) => {
                    const isOut = mov.movement_type === 'OUT' || mov.quantity < 0;
                    return (
                      <div key={mov.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110",
                          isOut ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
                        )}>
                          {isOut ? <TrendingDown size={18} className="text-rose-500" /> : <TrendingUp size={18} className="text-emerald-500"/>}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/80 p-5 rounded-2xl border border-white shadow-sm group-hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between space-x-2 mb-2">
                            <span className="font-black text-slate-800 tracking-tight">{mov.movement_type || (isOut ? 'Uscita (Scarico)' : 'Ingresso (Carico)')}</span>
                            <span className={cn("font-black text-xl px-2.5 py-1 rounded-lg", isOut ? "bg-rose-100/50 text-rose-600" : "bg-emerald-100/50 text-emerald-600")}>
                               {isOut ? '-' : '+'}{Math.abs(mov.quantity)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 font-medium mb-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                            {mov.notes || 'Nessuna nota aggiuntiva'}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                               LOTTO <span className="bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded shadow-sm leading-none">{mov.lot?.lot_number || mov.lot_number || 'N/D'}</span>
                             </div>
                             <time className="text-xs font-mono font-bold text-slate-400">{new Date(mov.created_at || mov.date).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
             )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 to-white backdrop-blur-md border border-indigo-100 shadow-[0_8px_30px_rgb(99,102,241,0.05)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
             <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Giacenza Totale</h3>
             <div className="text-6xl font-black text-indigo-900 tracking-tighter drop-shadow-sm">
               {totalStock} <span className="text-xl font-bold text-indigo-400 tracking-normal ml-1">{product.unit_of_measure?.toUpperCase() || 'PZ'}</span>
             </div>
             {totalStock < (product.min_stock_level || 0) && (
               <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-2xl text-sm font-bold flex items-center justify-between border border-amber-200 shadow-sm transition-all hover:bg-amber-100">
                 <span className="flex items-center gap-2"><AlertCircle size={18} className="text-amber-600" /> Sottoscorta</span>
                 <span className="bg-white px-2 py-1 rounded text-xs">Min: {product.min_stock_level}</span>
               </div>
             )}
          </div>

          <div className="glass-card p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 shadow-sm">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Dati Fornitore</h3>
             <div className="space-y-4">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nome Fornitore</div>
                  <div className="font-bold text-slate-800">{product.supplier_name || product.supplier?.name || 'Fornitore Sconosciuto'}</div>
                </div>
                {product.supplier?.email && (
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contatto Email</div>
                    <a href={`mailto:${product.supplier.email}`} className="font-bold text-primary hover:text-indigo-600 transition-colors">{product.supplier.email}</a>
                  </div>
                )}
             </div>
          </div>

          <div className="glass-card p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-rose-100 shadow-[0_8px_30px_rgb(225,29,72,0.03)] mt-8">
             <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert size={16} /> Area di Pericolo
             </h3>
             <p className="text-sm font-medium text-slate-500 mb-5 leading-relaxed">
               Blocca la movimentazione di questo prodotto in caso di difetti segnalati.
             </p>
             <button 
               onClick={() => console.log('WIP: Logica di Quarantena')}
               className="w-full py-3 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-all duration-300 rounded-xl font-bold flex items-center justify-center gap-2 group shadow-sm active:scale-95"
             >
               <ShieldAlert size={18} className="group-hover:animate-pulse" />
               Metti in Quarantena
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

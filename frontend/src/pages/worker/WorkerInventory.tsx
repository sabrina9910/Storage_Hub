import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Search, Package, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkerInventory() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: apiServices.getProducts,
  });

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventario</h1>
        <p className="text-slate-500 font-medium mt-1">Consulta le giacenze attuali.</p>
      </header>

      {/* Search Bar */}
      <div className="relative animate-in sm:zoom-in-95 duration-300">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Cerca per Nome o SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none glass bg-white/70 shadow-sm transition-all text-lg font-medium"
        />
      </div>

      {/* Product List */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-12 glass-card flex flex-col items-center">
            <Package size={48} className="text-slate-300 mb-4" />
            <p className="font-bold text-slate-500">Nessun prodotto trovato.</p>
            <p className="text-sm text-slate-400 mt-1">Prova a cambiare i termini di ricerca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
            {filteredProducts.map((p: any) => (
              <div
                key={p.id}
                className="p-4 glass-card bg-white/60 hover:bg-white transition-all flex justify-between items-center group animate-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Package size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5 bg-slate-100 w-fit px-1.5 py-0.5 rounded truncate">{p.sku}</p>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-primary leading-none">{p.unit_price}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Q.tà Tot.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action linking back to scanner */}
      <Link 
        to="/worker/movements"
        className="glass-card bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
             <Search size={20} />
          </div>
          <span className="font-bold">Esegui una scansione</span>
        </div>
        <ArrowRight className="text-white/50" />
      </Link>
    </div>
  );
}

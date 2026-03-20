import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Search, Loader2, Package, Users, History, AlertCircle, ArrowRight, X, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/common/SearchBar';

export default function GlobalSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(q);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('storagehub_search_history') || '[]');
      setSearchHistory(history);
    } catch {}
  }, [q]);

  const { data: products, isLoading: pLoading, isFetching: pFetching } = useQuery({ 
    queryKey: ['products_search', q], 
    queryFn: () => apiServices.getProducts(q),
    enabled: !!q
  });

  const { data: suppliers, isLoading: sLoading, isFetching: sFetching } = useQuery({ 
    queryKey: ['suppliers_search', q], 
    queryFn: () => apiServices.getSuppliers(q),
    enabled: !!q
  });

  const isLoading = pLoading || sLoading;
  const isFetching = pFetching || sFetching;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      const val = inputVal.trim();
      const history = [val, ...searchHistory.filter(h => h !== val)].slice(0, 10);
      setSearchHistory(history);
      localStorage.setItem('storagehub_search_history', JSON.stringify(history));
      setSearchParams({ q: val });
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('storagehub_search_history');
  };

  const hasNoResults = !isLoading && q && products?.length === 0 && suppliers?.length === 0;

  // Exact match logic
  const exactProductMatch = products?.find((p: any) => p.name.toLowerCase() === q.toLowerCase() || p.sku.toLowerCase() === q.toLowerCase());
  const exactSupplierMatch = suppliers?.find((s: any) => s.name.toLowerCase() === q.toLowerCase() || s.vat_number?.toLowerCase() === q.toLowerCase());

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Search size={32} className="text-primary" />
          Ricerca Globale
        </h2>
        <p className="text-slate-500 font-medium mt-1">Cerca tra catalogo prodotti, codici SKU, fornitori e partita IVA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Search Column */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSearchSubmit} className="glass-card p-6 flex items-center gap-4">
            <div className="flex-1">
              <SearchBar 
                value={inputVal}
                onChange={setInputVal}
                placeholder="Digita qualcosa e premi Invio..."
                isSearching={isFetching}
              />
            </div>
            <button 
              type="submit"
              disabled={!inputVal.trim() || isFetching}
              className="px-6 py-3 h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isFetching ? <Loader2 size={20} className="animate-spin" /> : 'Cerca'}
            </button>
          </form>

          {!q ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center">
              <Navigation size={48} className="mb-4 opacity-50" />
              <p className="font-bold text-lg">Inizia a cercare</p>
              <p className="text-sm mt-1">Usa la barra qui sopra per trovare prodotti o fornitori.</p>
            </div>
          ) : isLoading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center">
              <Loader2 size={48} className="mb-4 text-primary animate-spin opacity-50" />
              <p className="font-bold text-lg">Ricerca in corso...</p>
            </div>
          ) : hasNoResults ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center glass-card border-dashed">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="font-bold text-lg border-b border-transparent">Nessun risultato trovato per "{q}"</p>
              <p className="text-sm mt-2">Controlla l'ortografia o prova termini più generici.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Exact Match Hero Banner */}
              {(exactProductMatch || exactSupplierMatch) && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl p-1 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-500">
                  <div className="bg-white/95 backdrop-blur-xl rounded-[22px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                          Riscontro Esatto
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 line-clamp-1">
                          {exactProductMatch ? exactProductMatch.name : exactSupplierMatch.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-0.5 font-mono">
                          {exactProductMatch ? exactProductMatch.sku : `P.IVA: ${exactSupplierMatch.vat_number || 'N/D'}`}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to={exactProductMatch ? `/admin/products/${exactProductMatch.id}` : `/admin/suppliers/${exactSupplierMatch.id}`}
                      className="px-6 py-3 w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
                    >
                      Vai alla Scheda
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Products Section */}
              {products && products.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold flex items-center gap-2 text-slate-700">
                      <Package size={20} className="text-primary" /> Prodotti Trovati
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{products.length}</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100/50">
                    {products.map((p: any) => (
                      <Link key={`p-${p.id}`} to={`/admin/products/${p.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs font-mono text-slate-500">{p.sku}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {p.status === 'QUARANTINE' && (
                            <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] uppercase font-black tracking-widest rounded-md">Quarantena</span>
                          )}
                          <ArrowRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers Section */}
              {suppliers && suppliers.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold flex items-center gap-2 text-slate-700">
                      <Users size={20} className="text-amber-500" /> Fornitori Trovati
                      <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">{suppliers.length}</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100/50">
                    {suppliers.map((s: any) => (
                      <Link key={`s-${s.id}`} to={`/admin/suppliers`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Users size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{s.name}</p>
                            <p className="text-xs font-mono text-slate-500">P.IVA: {s.vat_number || 'N/D'}</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden sticky top-32">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="font-bold flex items-center gap-2 text-slate-700">
                <History size={18} className="text-primary" /> Cronologia
              </h3>
              {searchHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-slate-400 hover:text-rose-500 font-bold transition-colors uppercase tracking-wider"
                >
                  Svuota
                </button>
              )}
            </div>
            <div className="p-2">
              {searchHistory.length === 0 ? (
                <p className="p-4 text-center text-sm font-medium text-slate-400">Nessuna ricerca recente.</p>
              ) : (
                <ul className="space-y-1">
                  {searchHistory.map((h, i) => (
                    <li key={i}>
                      <button 
                        onClick={() => {
                          setInputVal(h);
                          setSearchParams({ q: h });
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary/5 rounded-lg flex items-center gap-3 transition-colors group"
                      >
                        <Clock size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 truncate">{h}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

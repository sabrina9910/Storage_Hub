import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { PackageOpen, Edit2, Layers, Trash2, CheckCircle2, ChevronDown, ChevronUp, Thermometer, Info, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import LotManagerModal from '@/components/admin/LotManagerModal';
import ProductCreateModal from '@/components/admin/ProductCreateModal';
import SearchBar from '@/components/common/SearchBar';
import FilterPanel from '@/components/common/FilterPanel';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProductCatalog() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const skuFilter = searchParams.get('sku');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState<Record<string, string>>({ category: 'ALL', status: 'ALL' });
  const { data: currentUser } = useQuery({ queryKey:['currentUser'], queryFn: apiServices.getCurrentUser });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);
  
  // Queries
  const queryParams = { search: debouncedSearch, category: filters.category, status: filters.status };
  const { data: products, isLoading: pLoading, isFetching: pFetching } = useQuery({ 
    queryKey: ['products', queryParams], 
    queryFn: () => apiServices.getProducts(queryParams) 
  });
  const { data: categories, isLoading: cLoading } = useQuery({ queryKey:['categories'], queryFn: apiServices.getCategories });
  const { data: lots, isLoading: lLoading } = useQuery({ queryKey:['lots'], queryFn: apiServices.getLots });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => apiServices.updateProductStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Stato prodotto aggiornato');
    },
    onError: () => toast.error('Errore durante l\'aggiornamento dello stato')
  });

  const handleSoftDelete = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler ${product.is_active ? 'disattivare' : 'riattivare'} il prodotto ${product.sku}?`)) {
      statusMutation.mutate({ id: product.id, isActive: !product.is_active });
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const safeProducts = Array.isArray(products?.results || products) ? (products?.results || products) : [];
  const safeLots = Array.isArray(lots?.results || lots) ? (lots?.results || lots) : [];
  const safeCats = Array.isArray(categories?.results || categories) ? (categories?.results || categories) : [];

  // Optimization: Group lots by product ID
  const lotsByProduct = useMemo(() => {
    const map = new Map();
    safeLots.forEach((lot: any) => {
      if (!map.has(lot.product)) map.set(lot.product, []);
      map.get(lot.product).push(lot);
    });
    return map;
  }, [safeLots]);

  // Optimization: Map categories by ID
  const categoryMap = useMemo(() => {
    const map = new Map();
    safeCats.forEach((cat: any) => map.set(cat.id, cat.name));
    return map;
  }, [safeCats]);

  const enrichedProducts = useMemo(() => {
    return safeProducts
      .map((p: any) => {
        const productLots = lotsByProduct.get(p.id) || [];
        const totalQty = productLots.reduce((sum: number, lot: any) => sum + lot.current_quantity, 0);
        return {
          ...p,
          totalQty,
          productLots,
          catName: categoryMap.get(p.category) || 'N/D',
          allergens: [],
          temp: p.description?.includes('Frigo') ? 'Frigo' : 'Ambiente'
        };
      })
      .filter((p: any) => !skuFilter || p.sku.toLowerCase().includes(skuFilter.toLowerCase()));
  }, [safeProducts, lotsByProduct, categoryMap, skuFilter]);

  const filterGroups = [
    {
      id: 'category',
      label: 'Categoria',
      options: [{ value: 'ALL', label: 'Tutte' }, ...safeCats.map((c: any) => ({ value: c.id, label: c.name }))]
    },
    {
      id: 'status',
      label: 'Stato',
      options: [
        { value: 'ALL', label: 'Tutti' },
        { value: 'active', label: 'Attivi' },
        { value: 'inactive', label: 'Inattivi' }
      ]
    }
  ];

  if (pLoading || lLoading || cLoading) return <div className="p-8 text-slate-500">Caricamento Catalogo...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-40">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {skuFilter ? `Risultato per SKU: ${skuFilter}` : 'Catalogo Prodotti'}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {skuFilter ? 'Visualizzazione filtrata dalla notifica.' : 'Gestione anagrafica e lotti inventario.'}
          </p>
          {skuFilter && (
            <button 
              onClick={() => setSearchParams({})}
              className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline group"
            >
              <X size={14} className="group-hover:rotate-90 transition-transform" /> Rimuovi filtro
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-80 h-12 flex items-center">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Cerca nome, SKU..."
              isSearching={pFetching && debouncedSearch !== ''}
            />
          </div>
          
          <FilterPanel 
            groups={filterGroups}
            activeFilters={filters}
            onFilterChange={(groupId, value) => setFilters(prev => ({ ...prev, [groupId]: value }))}
            onReset={() => setFilters({ category: 'ALL', status: 'ALL' })}
          />

          <button 
            onClick={() => setIsCreatingProduct(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 shrink-0 h-[46px]"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Crea Prodotto</span>
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase tracking-wider">
            <div className="col-span-2">SKU</div>
            <div className="col-span-3">Nome</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2 text-right">Prezzo Unit.</div>
            <div className="col-span-1 text-center">Giacenza</div>
            <div className="col-span-2 text-right pr-4">Azioni</div>
          </div>

          <div className="divide-y divide-slate-100">
            {enrichedProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <PackageOpen size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-lg">{debouncedSearch ? "Nessun elemento trovato per la tua ricerca." : "Il catalogo è attualmente vuoto."}</p>
                {debouncedSearch && <p className="text-sm mt-1">Prova a usare termini di ricerca diversi.</p>}
              </div>
            ) : (
              enrichedProducts.map((product: any) => {
                const isExpanded = expandedRows.includes(product.id);
                return (
                  <div key={product.id} className="flex flex-col border-b border-slate-100 last:border-0">
                    <div 
                      className={cn(
                        "grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-white/40 cursor-pointer", 
                        !product.is_active && "opacity-60 bg-slate-50/50"
                      )}
                      onClick={() => toggleRow(product.id)}
                    >
                      <div className="col-span-2 font-mono text-sm font-bold text-slate-600 flex items-center gap-2">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {product.sku}
                      </div>
                      <div className="col-span-3 flex flex-col justify-center">
                        <div className="font-bold text-slate-800 flex items-center gap-2 line-clamp-1" title={product.name}>
                          <Link to={`/admin/products/${product.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary hover:underline transition-all">
                            {product.name}
                          </Link>
                          {!product.is_active && <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">Inattivo</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded flex items-center gap-1 w-fit",
                            product.temp?.includes('Frigo') ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          )}>
                            <Thermometer size={10} /> {product.temp || 'N/D'}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 text-slate-500 text-sm font-medium">
                        {product.catName}
                      </div>
                      <div className="col-span-2 text-right font-bold text-slate-600">
                        €{Number(product.unit_price).toFixed(2)}
                      </div>
                      <div className="col-span-1 text-center font-black text-primary text-lg">
                        {product.totalQty}<span className="text-[10px] text-slate-400 ml-1 uppercase">{product.unit_of_measure}</span>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2 pr-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors active:scale-95"
                          title="Vedi Dettaglio"
                        >
                          <Info size={18} />
                        </Link>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors active:scale-95"
                          title="Gestisci Lotti"
                        >
                          <Layers size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleSoftDelete(product, e)}
                          className={cn(
                            "p-2 rounded-xl transition-colors active:scale-95",
                            product.is_active ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}
                          title={product.is_active ? "Disattiva (Soft Delete)" : "Riattiva Prodotto"}
                        >
                          {product.is_active ? <Trash2 size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Sub-table for Lots */}
                    {isExpanded && (
                      <div className="bg-slate-50/80 p-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Layers size={14} /> Lotti Attivi per {product.sku}
                        </h4>
                        
                        {product.productLots.length === 0 ? (
                          <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-500 text-center">
                            Nessun lotto attivo per questo prodotto.
                          </div>
                        ) : (
                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-black text-slate-500 tracking-wider">
                                <tr>
                                  <th className="px-6 py-3">Codice Lotto</th>
                                  <th className="px-6 py-3">Scadenza</th>
                                  <th className="px-6 py-3 text-right">Q.tà Attuale</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {product.productLots.map((lot: any) => {
                                  const expDate = new Date(lot.expiration_date);
                                  const isExpiringSoon = expDate.getTime() - new Date().getTime() < 15 * 24 * 60 * 60 * 1000;
                                  return (
                                    <tr key={lot.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-3 font-mono font-bold text-slate-700">{lot.lot_number}</td>
                                      <td className={cn("px-6 py-3 font-semibold", isExpiringSoon ? "text-amber-600" : "text-slate-600")}>
                                        {expDate.toLocaleDateString('it-IT')}
                                        {isExpiringSoon && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">In Scadenza</span>}
                                      </td>
                                      <td className="px-6 py-3 text-right font-black text-primary">{lot.current_quantity}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <LotManagerModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      
      {isCreatingProduct && (
        <ProductCreateModal onClose={() => setIsCreatingProduct(false)} />
      )}
    </div>
  );
}

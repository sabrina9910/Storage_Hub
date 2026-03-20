import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Filter, ArrowDownUp, Package, History, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';
import SearchBar from '@/components/common/SearchBar';
import FilterPanel from '@/components/common/FilterPanel';
import { useDebounce } from '@/hooks/useDebounce';

export default function MovementLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({ date: 'all', type: 'ALL', user: 'ALL' });
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Queries
  const { data: currentUser } = useQuery({ queryKey:['currentUser'], queryFn: apiServices.getCurrentUser });
  
  const queryParams = { search: debouncedSearch, type: filters.type, date: filters.date, user: filters.user };
  const { data: movements, isLoading: mLoading, isFetching: mFetching } = useQuery({ 
    queryKey: ['movements', queryParams], 
    queryFn: () => apiServices.getMovements(queryParams) 
  });
  const { data: lots, isLoading: lLoading } = useQuery({ queryKey:['lots'], queryFn: apiServices.getLots });
  const { data: products, isLoading: pLoading } = useQuery({ queryKey:['products'], queryFn: () => apiServices.getProducts() });
  const { data: users, isLoading: uLoading } = useQuery({ queryKey:['users'], queryFn: apiServices.getUsers });

  const isLoading = mLoading || lLoading || pLoading || uLoading;

  const safeMovements = Array.isArray(movements?.results || movements) ? (movements?.results || movements) : [];
  const safeLots = Array.isArray(lots?.results || lots) ? (lots?.results || lots) : [];
  const safeProducts = Array.isArray(products?.results || products) ? (products?.results || products) : [];
  const safeUsers = Array.isArray(users?.results || users) ? (users?.results || users) : [];

  // Enriched Data combining relations
  const enrichedMovements = useMemo(() => {
    if (isLoading) return [];
    return safeMovements.map((m: any) => {
      const lot = safeLots.find((l:any) => l.id === m.lot);
      const product = lot ? safeProducts.find((p:any) => p.id === lot.product) : null;
      const user = safeUsers.find((u:any) => u.id === m.user);
      
      const foodMocks = [
        { name: 'Parmigiano Reggiano DOP 24 Mesi' },
        { name: 'Latte Intero UHT 1L' },
        { name: 'Pasta di Gragnano IGP 500g' },
        { name: 'Olio Extra Vergine Oliva 1L' },
        { name: 'Prosciutto di Parma DOP' },
      ];
      
      let mockName = product?.name || 'N/D';
      if (product?.id) {
        const stableIndex = Math.abs(String(product.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % foodMocks.length;
        mockName = foodMocks[stableIndex].name;
      }

      return {
        ...m,
        lot_number: lot?.lot_number || 'N/D',
        sku: product?.sku || 'N/D',
        product_name: mockName,
        user_email: user?.email || 'Sistema'
      };
    }).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [safeMovements, safeLots, safeProducts, safeUsers, isLoading]);

  // Filtering Logic (frontend fallback for complex dates if backend isn't handling it, though we pass it anyway)
  const filteredMovements = useMemo(() => {
    let result = enrichedMovements;
    const now = new Date();

    if (filters.date !== 'all') {
      let thresholdDate = new Date(0);
      if (filters.date === 'today') thresholdDate = subDays(now, 1);
      if (filters.date === '30days') thresholdDate = subDays(now, 30);
      
      result = result.filter((m: any) => isAfter(new Date(m.timestamp), thresholdDate));
    }

    if (filters.type !== 'ALL') {
      result = result.filter((m: any) => m.movement_type === filters.type);
    }

    if (filters.user !== 'ALL') {
      result = result.filter((m: any) => m.user && m.user.toString() === filters.user);
    }

    return result;
  }, [enrichedMovements, filters]);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowRight size={14} />;
      case 'OUT': return <ArrowLeft size={14} />;
      case 'RETURN': return <RefreshCw size={14} />;
      case 'QUARANTINE': return <AlertTriangle size={14} />;
      default: return <ArrowDownUp size={14} />;
    }
  };

  const getMovementStyle = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'OUT': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'RETURN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'QUARANTINE': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500">Caricamento Registro...</div>;

  const filterGroups = [
    {
      id: 'date',
      label: 'Periodo',
      options: [
        { value: 'all', label: 'Sempre' },
        { value: 'today', label: 'Oggi' },
        { value: '7days', label: 'Ultimi 7 Giorni' },
        { value: '30days', label: 'Ultimi 30 Giorni' }
      ]
    },
    {
      id: 'type',
      label: 'Tipo Movimento',
      options: [
        { value: 'ALL', label: 'Tutti' },
        { value: 'IN', label: 'Entrata (IN)' },
        { value: 'OUT', label: 'Uscita (OUT)' },
        { value: 'RETURN', label: 'Reso (RETURN)' },
        { 
          value: 'QUARANTINE', 
          label: 'Quarantena (QUARANTINE)',
          hidden: currentUser?.role === 'magazziniere' && !currentUser?.is_superuser 
        }
      ]
    },
    {
      id: 'user',
      label: 'Operatore',
      options: [
        { value: 'ALL', label: 'Tutti gli Operatori' },
        ...(safeUsers.map((u: any) => ({ value: u.id.toString(), label: u.email })))
      ]
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Registro Movimenti</h2>
          <p className="text-slate-500 font-medium mt-1">Audit trail e storico dettagliato delle operazioni di magazzino.</p>
        </div>
      </div>
          {/* Filters Toolbar */}
      <div className="glass-card mb-6 p-4 relative z-40">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Cerca per prodotto, SKU, lotto (Premi Invio)..."
              isSearching={mFetching && debouncedSearch !== ''}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <FilterPanel 
              groups={filterGroups}
              activeFilters={filters}
              onFilterChange={(groupId, value) => setFilters(prev => ({ ...prev, [groupId]: value }))}
              onReset={() => setFilters({ date: 'all', type: 'ALL', user: 'ALL' })}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px]">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase tracking-wider">
              <div className="col-span-2">Data / Ora</div>
              <div className="col-span-3">Prodotto</div>
              <div className="col-span-2">Lotto</div>
              <div className="col-span-2 text-center">Tipo</div>
              <div className="col-span-1 text-center">Q.tà</div>
              <div className="col-span-2">Operatore</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100/50">
              {filteredMovements.length === 0 ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                  <History size={48} className="mb-4 opacity-50 text-slate-300" />
                  <p className="font-semibold text-lg">{debouncedSearch ? "Nessun elemento trovato per la tua ricerca." : "Nessun movimento trovato"}</p>
                  <p className="text-sm mt-1">{debouncedSearch ? "Prova con una keyword diversa." : "Modifica i filtri di ricerca per ottenere altri risultati."}</p>
                </div>
              ) : (
                filteredMovements.map((movement: any) => {
                  const isQuarantine = movement.movement_type === 'QUARANTINE';
                  return (
                    <div 
                      key={movement.id} 
                      className={cn(
                        "grid grid-cols-12 gap-4 p-4 items-center transition-all hover:bg-slate-50 border-b border-slate-100 last:border-0",
                        isQuarantine ? "bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-l-amber-500 shadow-sm relative z-10" : "bg-white border-l-4 border-l-transparent"
                      )}
                    >
                      <div className="col-span-2 text-sm text-slate-600 font-medium">
                        {format(new Date(movement.timestamp), "dd MMM yyyy, HH:mm", { locale: it })}
                      </div>
                      
                      <div className="col-span-3">
                        <div className="font-bold text-slate-800 line-clamp-1" title={movement.product_name}>{movement.product_name}</div>
                        <div className="text-xs font-mono text-slate-400">{movement.sku}</div>
                      </div>
                      
                      <div className="col-span-2 font-mono text-sm font-semibold text-slate-600">
                        {movement.lot_number}
                      </div>
                      
                      <div className="col-span-2 flex justify-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 border",
                          getMovementStyle(movement.movement_type)
                        )}>
                          {getMovementIcon(movement.movement_type)}
                          {movement.movement_type}
                        </span>
                      </div>
                      
                      <div className="col-span-1 text-center font-black text-slate-800">
                        {movement.movement_type === 'OUT' ? '-' : '+'}{movement.quantity}
                        <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">{movement.unit_of_measure}</span>
                      </div>
                      
                      <div className="col-span-2 text-sm text-slate-800 font-bold truncate flex items-center gap-2" title={movement.user_email}>
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 border border-white shrink-0">
                          {movement.user_email.charAt(0).toUpperCase()}
                        </div>
                        {movement.user_email.split('@')[0]}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

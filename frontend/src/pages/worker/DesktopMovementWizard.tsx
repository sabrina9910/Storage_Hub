import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Search, Loader2, ArrowRight, ArrowLeft, ArrowDownCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomNumericKeypad from '@/components/worker/CustomNumericKeypad';

export default function DesktopMovementWizard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selections
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'RETURN' | 'QUARANTINE' | null>(null);
  const [quantity, setQuantity] = useState<string>('');

  // Queries
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: apiServices.getProducts,
  });

  const { data: allLots, isLoading: loadingLots } = useQuery({
    queryKey: ['lots'],
    queryFn: apiServices.getLots,
  });

  // Mutation
  const movementMutation = useMutation({
    mutationFn: apiServices.createMovement,
    onSuccess: () => {
      toast.custom((t) => (
        <div className="glass-card flex items-center gap-3 p-4 bg-success/10 border-success/20 w-full max-w-sm mx-auto shadow-2xl">
          <CheckCircle2 className="text-success h-6 w-6" />
          <div>
            <p className="font-bold text-slate-800">Operazione Completata</p>
            <p className="text-sm text-slate-600">Quantità aggiornata nel sistema.</p>
          </div>
        </div>
      ), { duration: 4000, position: 'top-center' });
      resetWizard();
    },
    onError: (error: any) => {
      // Show backend validation error (e.g., insufficient stock from atomic transaction)
      const errDetail = error?.response?.data?.quantity?.[0] || 'Errore durante la registrazione del movimento.';
      toast.error(errDetail);
    }
  });

  const resetWizard = () => {
    setSelectedProduct(null);
    setSelectedLot(null);
    setMovementType(null);
    setQuantity('');
    setSearchTerm('');
  };

  const handleProductSelect = (product: any) => {
    if (selectedProduct?.id !== product.id) {
      setSelectedProduct(product);
      setSelectedLot(null); // Reset lot when product changes
      setMovementType(null);
      setQuantity('');
    }
  };

  const handleLotSelect = (lot: any, isRecommended: boolean) => {
    if (movementType === 'OUT' && !isRecommended) {
       toast.error("FIFO Obbligatorio: Devi selezionare il lotto in scadenza indicato dal sistema per le USCITE.", { icon: '⚠️' })
       return;
    }
    setSelectedLot(lot);
  };

  const handleMovementTypeSelect = (type: any) => {
    setMovementType(type);
    setSelectedLot(null); // Force lot re-selection if type changes (in case of strict FIFO enforcing)
  };

  const handleSubmit = () => {
    if (!selectedLot || !movementType || !quantity || parseInt(quantity) <= 0) {
      toast.error('Completa tutti i campi prima di procedere');
      return;
    }

    movementMutation.mutate({
      lot: selectedLot.id,
      movement_type: movementType,
      quantity: parseInt(quantity),
    });
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const productLots = useMemo(() => {
    if (!allLots || !selectedProduct) return [];
    return allLots.filter((l: any) => l.product === selectedProduct.id && l.current_quantity > 0);
  }, [allLots, selectedProduct]);
  
  // Find nearest expiring lot for strict FIFO logic
  const nearestLot = useMemo(() => {
    if (!productLots.length) return null;
    return [...productLots].sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())[0];
  }, [productLots]);


  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registra Movimento</h1>
        <p className="text-slate-500 font-medium mt-1">Seleziona prodotto, operazione e quantità per aggiornare il magazzino.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
        
        {/* LEFT COLUMN: Product & Lot Selection */}
        <div className="glass-card p-6 flex flex-col gap-6 rounded-3xl h-[75vh]">
          {/* 1. Category / Product Filter */}
          <div className="space-y-3 shrink-0">
             <h2 className="font-bold text-slate-700 text-sm tracking-wider uppercase">1. Seleziona Prodotto</h2>
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cerca prodotto per Nome o SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/60 shadow-inner transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-1 space-y-3 custom-scrollbar">
              {loadingProducts ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center p-8 text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">Nessun prodotto trovato.</div>
              ) : (
                filteredProducts.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductSelect(p)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group",
                      selectedProduct?.id === p.id 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-white/60 hover:bg-white border-slate-200"
                    )}
                  >
                    <div>
                      <p className={cn("font-bold text-base", selectedProduct?.id === p.id ? "text-white" : "text-slate-800")}>{p.name}</p>
                      <p className={cn(
                        "text-xs font-mono mt-1 w-fit px-1.5 py-0.5 rounded font-medium",
                         selectedProduct?.id === p.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      )}>{p.sku}</p>
                    </div>
                    {selectedProduct?.id === p.id && <CheckCircle2 size={20} className="text-white" />}
                  </button>
                ))
              )}
          </div>
        </div>

        {/* RIGHT COLUMN: Action & Qty */}
        <div className={cn(
          "flex flex-col gap-6 h-[75vh] transition-opacity duration-300",
          !selectedProduct ? "opacity-30 pointer-events-none" : "opacity-100"
        )}>
           
           {/* 2. Choose Movement Type First (Dictates FIFO Logic) */}
           <div className="glass-card p-6 rounded-3xl shrink-0">
              <h2 className="font-bold text-slate-700 text-sm tracking-wider uppercase mb-4 flex justify-between items-center">
                <span>2. Tipo Operazione</span>
                {movementType && <span className="text-primary text-xs bg-primary/10 px-2 py-1 rounded">Selezionato</span>}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-3">
                {[
                  { id: 'IN', label: 'ENTRATA', icon: ArrowRight, color: 'success', bg: 'bg-emerald-100/50', text: 'text-emerald-700', activeBg: 'bg-success', ring: 'ring-success/30' },
                  { id: 'OUT', label: 'USCITA', icon: ArrowLeft, color: 'error', bg: 'bg-rose-100/50', text: 'text-rose-700', activeBg: 'bg-error', ring: 'ring-error/30' },
                  { id: 'RETURN', label: 'RESO', icon: ArrowDownCircle, color: 'primary', bg: 'bg-indigo-100/50', text: 'text-indigo-700', activeBg: 'bg-primary', ring: 'ring-primary/30' },
                  { id: 'QUARANTINE', label: 'SCARTO', icon: AlertTriangle, color: 'warning', bg: 'bg-amber-100/50', text: 'text-amber-700', activeBg: 'bg-warning', ring: 'ring-warning/30' },
                ].map(type => {
                  const Icon = type.icon;
                  const isActive = movementType === type.id;
                  return (
                    <button 
                      key={type.id}
                      onClick={() => handleMovementTypeSelect(type.id)}
                      className={cn(
                        "p-3 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm",
                        isActive 
                          ? `${type.activeBg} text-white border-${type.color} ring-2 ${type.ring} ring-offset-2` 
                          : `glass bg-white/60 text-slate-600 border-slate-200 hover:${type.bg} hover:${type.text}`
                      )}
                    >
                      <Icon size={18} /> {type.label}
                    </button>
                  )
                })}
              </div>
              {movementType === 'OUT' && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex gap-3 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                  <p><strong>Strict FIFO Attivo:</strong> Per le uscite, il sistema richiede la selezione obbligatoria del lotto con la scadenza più prossima (evidenziato in verde).</p>
                </div>
              )}
           </div>

           {/* 3. Select Lot (Depends on Type) */}
           <div className={cn(
             "glass-card p-6 flex flex-col gap-4 rounded-3xl flex-1 overflow-hidden transition-opacity duration-300",
             !movementType ? "opacity-30 pointer-events-none" : "opacity-100"
           )}>
             <h2 className="font-bold text-slate-700 text-sm tracking-wider uppercase shrink-0">3. Conferma Lotto</h2>
             <div className="flex-1 overflow-y-auto px-1 space-y-3 custom-scrollbar">
                {productLots.length === 0 ? (
                   <div className="text-center p-8 text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">Nessun lotto attivo con giacenza.</div>
                ) : (
                  productLots.map((l: any) => {
                    const isSuggested = nearestLot?.id === l.id;
                    const isFIFOEnforced = movementType === 'OUT';
                    const isSelectable = !isFIFOEnforced || (isFIFOEnforced && isSuggested);
                    
                    return (
                      <button
                        key={l.id}
                        onClick={() => handleLotSelect(l, isSuggested)}
                        disabled={!isSelectable}
                        className={cn(
                          "w-full text-left p-4 rounded-xl transition-all relative overflow-hidden group border",
                          selectedLot?.id === l.id 
                             ? "bg-slate-800 text-white border-slate-800 shadow-lg" 
                             : isSelectable 
                                ? (isSuggested && isFIFOEnforced ? "bg-success/10 border-success/30 hover:bg-success/20 ring-1 ring-success/30" : "bg-white/60 hover:bg-white border-slate-200")
                                : "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed" // Disabled look for non-FIFO lots during OUT
                        )}
                      >
                        {(isSuggested && isFIFOEnforced) && (
                          <div className={cn(
                            "absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-widest",
                            selectedLot?.id === l.id ? "bg-success text-white" : "bg-success/20 text-success-800 border-b border-l border-success/30"
                          )}>
                            MUST PICK (FIFO)
                          </div>
                        )}
                        <div className="flex justify-between items-end mt-1">
                          <div>
                            <p className={cn("font-mono font-bold text-lg", selectedLot?.id === l.id ? "text-white" : "text-slate-800")}>{l.lot_number}</p>
                            <p className={cn("text-xs font-medium mt-1 flex items-center gap-1", selectedLot?.id === l.id ? "text-slate-300" : "text-slate-500")}>
                              <ArrowDownCircle size={12}/> Scade: {l.expiration_date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-3xl font-black leading-none", selectedLot?.id === l.id ? "text-white" : "text-primary")}>{l.current_quantity}</p>
                            <p className={cn("text-[10px] uppercase font-bold mt-1", selectedLot?.id === l.id ? "text-slate-400" : "text-slate-400")}>Disponibili</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
             </div>
           </div>

           {/* 4. Quantity & Submit */}
           <div className={cn(
             "glass-card p-6 rounded-3xl shrink-0 flex items-center gap-6 transition-opacity duration-300",
             !selectedLot ? "opacity-30 pointer-events-none" : "opacity-100"
           )}>
              <div className="flex-1">
                 <h2 className="font-bold text-slate-700 text-sm tracking-wider uppercase mb-3">4. Quantità</h2>
                 <div className="relative">
                    <input 
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      className="w-full text-4xl font-black text-slate-800 tabular-nums py-2 px-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none bg-white transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase text-xs tracking-widest">
                       UNITÀ
                    </div>
                 </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={movementMutation.isPending || !movementType || !quantity || parseInt(quantity) <= 0}
                className="w-1/2 h-[72px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black rounded-xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex justify-center items-center gap-2 text-xl tracking-wide self-end"
              >
                {movementMutation.isPending ? <Loader2 className="animate-spin w-8 h-8" /> : 'CONFERMA'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

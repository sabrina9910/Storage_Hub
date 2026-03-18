import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { ChevronRight, Plus, Package, Building2, X, DollarSign, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function SupplierManager() {
  const queryClient = useQueryClient();
  const [expandedSupplier, setExpandedSupplier] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_person: '', email: '', phone: '' });

  // Queries
  const { data: suppliers, isLoading: sLoading } = useQuery({ queryKey: ['suppliers'], queryFn: apiServices.getSuppliers });
  const { data: products, isLoading: pLoading } = useQuery({ queryKey: ['products'], queryFn: apiServices.getProducts });
  const { data: lots, isLoading: lLoading } = useQuery({ queryKey: ['lots'], queryFn: apiServices.getLots });

  const addMutation = useMutation({
    mutationFn: apiServices.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornitore creato con successo');
      setIsAddModalOpen(false);
      setNewSupplier({ name: '', contact_person: '', email: '', phone: '' });
    },
    onError: () => toast.error('Errore durante la creazione del Fornitore')
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return toast.error('Il nome è obbligatorio');
    addMutation.mutate(newSupplier);
  };

  const toggleExpand = (id: number) => {
    setExpandedSupplier(expandedSupplier === id ? null : id);
  };

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeLots = Array.isArray(lots) ? lots : [];

  // Helper to get products for a supplier and their total stock
  const getSupplierProducts = (supplierId: number) => {
    const sProducts = safeProducts.filter(p => p.supplier === supplierId);
    return sProducts.map(p => {
      const totalStock = safeLots
        .filter(l => l.product === p.id)
        .reduce((sum, lot) => sum + lot.current_quantity, 0);
      return { ...p, totalStock };
    });
  };

  if (sLoading || pLoading || lLoading) return <div className="p-8 text-slate-500">Caricamento Fornitori...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestione Fornitori</h2>
          <p className="text-slate-500 font-medium mt-1">Elenco fornitori e prodotti associati.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Aggiungi Fornitore
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-4">Nome Azienda</div>
            <div className="col-span-3">Referente</div>
            <div className="col-span-4 flex justify-between">
              <span>Contatti</span>
              <span>Prodotti</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {safeSuppliers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Nessun fornitore registrato.</div>
            ) : (
              safeSuppliers.map(supplier => {
                const isExpanded = expandedSupplier === supplier.id;
                const suppProducts = getSupplierProducts(supplier.id);

                return (
                  <div key={supplier.id} className="transition-colors hover:bg-white/40">
                    <div 
                      onClick={() => toggleExpand(supplier.id)}
                      className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                    >
                      <div className="col-span-1 flex justify-center text-slate-400">
                        <ChevronRight size={20} className={cn("transition-transform", isExpanded && "text-primary translate-x-1")} />
                      </div>
                      <div className="col-span-4 font-bold text-slate-800 flex items-center gap-2">
                        <Building2 size={16} className={cn(isExpanded ? "text-primary" : "text-slate-400")} /> {supplier.name}
                      </div>
                      <div className="col-span-3 text-slate-600">
                        {supplier.contact_person || '-'}
                      </div>
                      <div className="col-span-4 flex justify-between items-center text-sm">
                        <div className="text-slate-500">
                          {supplier.email && <div>{supplier.email}</div>}
                          {supplier.phone && <div>{supplier.phone}</div>}
                        </div>
                        <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-xs ring-1 ring-slate-200">
                          {suppProducts.length} referenze
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Side Panel (Sheet) for Supplier Details */}
      {expandedSupplier && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
            onClick={() => setExpandedSupplier(null)} 
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200">
            {(() => {
              const supplier = safeSuppliers.find(s => s.id === expandedSupplier);
              if (!supplier) return null;
              const suppProducts = getSupplierProducts(supplier.id);
              const totalInventoryValue = suppProducts.reduce((sum, p) => sum + (p.unit_price * p.totalStock), 0);
              
              return (
                <>
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between shrink-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><Store size={20} /></span>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{supplier.name}</h3>
                      </div>
                      <p className="text-sm font-medium text-slate-500 ml-9">Scheda Fornitore e Referenze</p>
                    </div>
                    <button onClick={() => setExpandedSupplier(null)} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                    {/* Aggregated KPI */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-100 mb-1">
                        <DollarSign size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Valore a Magazzino</span>
                      </div>
                      <div className="text-3xl font-black tracking-tighter">
                        €{totalInventoryValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Package size={14} /> Prodotti Forniti ({suppProducts.length})
                      </h4>
                      {suppProducts.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500 text-center font-medium">
                          Nessun prodotto associato a questo fornitore.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {suppProducts.map(sp => (
                            <div key={sp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-primary/30 transition-colors">
                              <div>
                                <div className="text-[10px] font-bold font-mono text-slate-400 mb-0.5">{sp.sku}</div>
                                <div className="font-bold text-slate-800 text-sm">{sp.name}</div>
                                <div className="text-xs text-slate-500 font-medium">€{Number(sp.unit_price).toFixed(2)} / {sp.unit_of_measure}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Giacenza</div>
                                <div className="text-lg font-black text-primary">{sp.totalStock}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card bg-white/90 p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Nuovo Fornitore</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Azienda *</label>
                <input 
                  type="text" 
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Referente</label>
                <input 
                  type="text" 
                  value={newSupplier.contact_person}
                  onChange={e => setNewSupplier({...newSupplier, contact_person: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input 
                    type="email" 
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Telefono</label>
                  <input 
                    type="text" 
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  disabled={addMutation.isPending}
                  className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {addMutation.isPending ? 'Salvataggio...' : 'Salva Fornitore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

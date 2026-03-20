import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiServices } from '@/lib/api';
import { ChevronRight, Plus, Package, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SupplierManager() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
    navigate(`/admin/suppliers/${id}`);
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
                const suppProducts = getSupplierProducts(supplier.id);

                return (
                  <div key={supplier.id} className="transition-colors hover:bg-white/40">
                    <div 
                      onClick={() => navigate(`/admin/suppliers/${supplier.id}`)}
                      className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                    >
                      <div className="col-span-1 flex justify-center text-slate-400">
                        <ChevronRight size={20} className="transition-transform" />
                      </div>
                      <div className="col-span-4 font-bold text-slate-800 flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" /> {supplier.name}
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

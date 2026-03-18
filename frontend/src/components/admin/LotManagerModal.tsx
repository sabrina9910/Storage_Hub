import { useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { X, Plus, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LotManagerModal({ product, onClose }: { product: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [newLot, setNewLot] = useState({ lot_number: '', expiration_date: '', current_quantity: 0 });
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { data: lots, isLoading } = useQuery({ 
    queryKey: ['lots'], 
    queryFn: apiServices.getLots 
  });

  const productLots = Array.isArray(lots) ? lots.filter(l => l.product === product.id) : [];

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }: { id: number, qty: number }) => apiServices.updateLotQuantity(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast.success('Quantità aggiornata');
    },
    onError: () => toast.error('Errore durante l\'aggiornamento')
  });

  const addLotMutation = useMutation({
    mutationFn: (data: any) => apiServices.createLot({ ...data, product: product.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast.success('Lotto aggiunto manualmente');
      setIsAddingLot(false);
      setNewLot({ lot_number: '', expiration_date: '', current_quantity: 0 });
    },
    onError: () => toast.error('Errore durante la creazione del lotto')
  });

  const handleUpdateQuantity = (lotId: number) => {
    const qty = quantities[lotId];
    if (qty !== undefined) {
      updateMutation.mutate({ id: lotId, qty });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLot.lot_number || !newLot.expiration_date) return toast.error('Compila tutti i campi');
    addLotMutation.mutate(newLot);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card bg-white/95 w-full max-w-2xl max-h-[90vh] shadow-2xl relative flex flex-col">
        {/* Header content with absolute close button */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
             <div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">Gestione Lotti</h3>
               <p className="text-sm font-bold text-primary mt-1 flex items-center gap-2">
                 <span className="bg-primary/10 px-2 py-0.5 rounded text-xs tracking-wider uppercase">{product.sku}</span>
                 {product.name}
               </p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
               <X size={24} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="space-y-4 mb-8">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
              Lotti Attivi
              <button 
                onClick={() => setIsAddingLot(!isAddingLot)}
                className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
               >
                <Plus size={14} /> Nuovo Lotto Manuale
              </button>
            </h4>

            {isAddingLot && (
              <form onSubmit={handleAddSubmit} className="p-4 bg-white rounded-xl border border-primary/20 shadow-sm mb-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 text-warning mb-3 bg-warning/10 p-2 rounded-lg text-xs font-semibold">
                  <AlertCircle size={16} /> L'aggiunta manuale non genera un record di movimento. Usa con cautela.
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nr. Lotto</label>
                    <input type="text" value={newLot.lot_number} onChange={e => setNewLot({...newLot, lot_number: e.target.value})} className="w-full mt-1 px-3 py-1.5 rounded-lg border focus:border-primary outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Scadenza</label>
                    <input type="date" value={newLot.expiration_date} onChange={e => setNewLot({...newLot, expiration_date: e.target.value})} className="w-full mt-1 px-3 py-1.5 rounded-lg border focus:border-primary outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Q.tà Iniziale</label>
                    <input type="number" min="0" value={newLot.current_quantity || ''} onChange={e => setNewLot({...newLot, current_quantity: parseInt(e.target.value) || 0})} className="w-full mt-1 px-3 py-1.5 rounded-lg border focus:border-primary outline-none" required />
                  </div>
                </div>
                <div className="text-right mt-3">
                  <button type="submit" disabled={addLotMutation.isPending} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Salva Lotto</button>
                </div>
              </form>
            )}

            {isLoading ? (
              <div className="text-center text-slate-400 py-4">Caricamento...</div>
            ) : productLots.length === 0 ? (
              <div className="text-center bg-white border border-slate-200 rounded-xl py-8 text-slate-400">Nessun lotto attivo trovato.</div>
            ) : (
              <div className="space-y-2">
                {productLots.map(lot => (
                  <div key={lot.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-800">{lot.lot_number}</span>
                      <span className="text-xs font-medium text-slate-400 shrink-0">Scadenza: {lot.expiration_date}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          min="0"
                          value={quantities[lot.id] !== undefined ? quantities[lot.id] : lot.current_quantity}
                          onChange={(e) => setQuantities({ ...quantities, [lot.id]: parseInt(e.target.value) || 0 })}
                          className="w-16 text-center font-bold px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
                        />
                        <span className="text-xs font-bold text-slate-400 ml-2">{product.unit_of_measure}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleUpdateQuantity(lot.id)}
                        disabled={quantities[lot.id] === undefined || quantities[lot.id] === lot.current_quantity || updateMutation.isPending}
                        className="p-2 bg-success/10 text-success hover:bg-success/20 rounded-lg disabled:opacity-30 transition-colors"
                        title="Salva Quantità"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

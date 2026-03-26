import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, CalendarClock, Trash2, Edit2, X, Save } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface SupplyLot {
  id: number;
  lot_number: string;
  product_name?: string;
  product_sku?: string;
  product?: { name: string; sku: string };
  product_detail?: { name: string; sku: string };
  current_quantity: number;
  expiration_date: string;
}

const fetchAtRiskLots = async (): Promise<SupplyLot[]> => {
  return await fetchApi('/lots/');
};

export default function AtRiskLots() {
  const queryClient = useQueryClient();
  const [editingLot, setEditingLot] = useState<SupplyLot | null>(null);
  const [editForm, setEditForm] = useState({ lot_number: '', current_quantity: 0, expiration_date: '' });

  const { data: lots, isLoading, isError } = useQuery({
    queryKey: ['at-risk-lots'],
    queryFn: fetchAtRiskLots,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // DELETE request without expecting strict JSON response since Django returns 204 No Content
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/lots/${id}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      if (!response.ok) throw new Error("Delete failed");
      return true;
    },
    onSuccess: () => {
      toast.success('Lotto eliminato con successo dal magazzino');
      queryClient.invalidateQueries({ queryKey: ['at-risk-lots'] });
    },
    onError: () => {
      toast.error("Errore durante l'eliminazione del lotto");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number, lot_number: string, current_quantity: number, expiration_date: string }) => {
      return await fetchApi(`/lots/${data.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          lot_number: data.lot_number,
          current_quantity: data.current_quantity,
          expiration_date: data.expiration_date.split('T')[0],
        }),
      });
    },
    onSuccess: () => {
      toast.success('Lotto aggiornato con successo');
      setEditingLot(null);
      queryClient.invalidateQueries({ queryKey: ['at-risk-lots'] });
    },
    onError: () => toast.error("Errore durante l'aggiornamento del lotto"),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Sei sicuro di voler eliminare definitivamente questo lotto? L'operazione rimuoverà questa giacenza.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (lot: SupplyLot) => {
    setEditingLot(lot);
    setEditForm({
      lot_number: lot.lot_number,
      current_quantity: lot.current_quantity,
      expiration_date: lot.expiration_date.split('T')[0]
    });
  };

  const handleSaveEdit = () => {
    if (editingLot) {
      updateMutation.mutate({
        id: editingLot.id,
        ...editForm
      });
    }
  };

  const today = new Date();
  
  const atRiskLots = lots?.filter(lot => {
    if (!lot.expiration_date) return false;
    const expDate = new Date(lot.expiration_date);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 30;
  }).sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()) || [];

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

      <div className="glass-card p-8 min-h-[60vh] rounded-3xl bg-white/60 backdrop-blur-xl border border-rose-500/20 shadow-[0_8px_30px_rgb(225,29,72,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 border border-rose-500/20 shadow-inner">
              <CalendarClock size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lotti a Rischio</h1>
              <p className="text-slate-500 font-medium mt-1">Gestione allarmi giacenze in scadenza entro i prossimi 30 giorni.</p>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-md border border-rose-200 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3">
             <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Lotti Critici</span>
                <span className="text-xl font-black text-slate-700">{atRiskLots.length}</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xl border border-rose-200 shadow-inner">
               {atRiskLots.length}
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white/40 animate-pulse rounded-2xl border border-white/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-rose-500 bg-white/30 rounded-2xl border border-rose-200 border-dashed">
            <AlertCircle size={48} className="mb-4 opacity-50 animate-pulse" />
            <p className="font-semibold text-xl text-slate-800">Errore nel caricamento dei dati</p>
            <p className="text-sm text-slate-500 mt-2">Impossibile recuperare i lotti dall'API.</p>
          </div>
        ) : atRiskLots.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white/30 rounded-2xl border border-emerald-200 border-dashed backdrop-blur-sm">
            <CalendarClock size={48} className="mx-auto mb-4 text-emerald-500 opacity-60" />
            <p className="font-bold text-xl text-emerald-700">Situazione Ottimale</p>
            <p className="text-sm text-emerald-600/80 mt-2">L'inventario è in salute: non ci sono lotti in scadenza a breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {atRiskLots.map((lot) => {
              if (editingLot?.id === lot.id) {
                return (
                  <div key={lot.id} className="p-6 bg-white/95 backdrop-blur-xl border-2 border-primary/40 shadow-xl rounded-2xl flex flex-col gap-4 relative z-10 scale-[1.02] transition-all">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                       <Edit2 size={18} className="text-primary" />
                       <h3 className="font-bold text-slate-800 text-lg">Modifica Variante</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Numero Lotto</label>
                        <input type="text" className="w-full mt-1 px-4 py-2 border-2 border-slate-100 focus:border-primary/50 rounded-xl text-sm font-semibold outline-none transition-all focus:bg-white" value={editForm.lot_number} onChange={(e) => setEditForm({...editForm, lot_number: e.target.value})} placeholder="Es. LOT-XYZ" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Giacenza (Pz)</label>
                          <input type="number" min="0" className="w-full mt-1 px-4 py-2 border-2 border-slate-100 focus:border-primary/50 rounded-xl text-sm font-black text-slate-700 outline-none transition-all focus:bg-white" value={editForm.current_quantity} onChange={(e) => setEditForm({...editForm, current_quantity: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Scadenza</label>
                          <input type="date" className="w-full mt-1 px-4 py-2 border-2 border-slate-100 focus:border-primary/50 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all focus:bg-white" value={editForm.expiration_date} onChange={(e) => setEditForm({...editForm, expiration_date: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                      <button onClick={() => setEditingLot(null)} className="px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
                        <X size={16} /> Annulla
                      </button>
                      <button 
                        onClick={handleSaveEdit} 
                        disabled={updateMutation.isPending}
                        className="px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                      >
                        <Save size={16} /> {updateMutation.isPending ? 'Salvataggio...' : 'Salva'}
                      </button>
                    </div>
                  </div>
                );
              }

              const expDate = new Date(lot.expiration_date);
              const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const isExpired = daysDiff < 0;
              const isCritical = daysDiff >= 0 && daysDiff <= 7;
              
              const productName = lot.product_detail?.name || lot.product_name || lot.product?.name || 'Prodotto Sconosciuto';
              const productSku = lot.product_detail?.sku || lot.product_sku || lot.product?.sku || 'SKU N/A';
              
              return (
                <div key={lot.id} className={`p-6 bg-white/60 backdrop-blur-sm shadow-sm rounded-2xl transition-all duration-300 flex flex-col justify-between group border border-transparent ${isExpired ? 'border-rose-300/60 bg-rose-50/70 shadow-rose-500/5 hover:border-rose-400' : isCritical ? 'border-amber-300/50 bg-amber-50/60 shadow-amber-500/5 hover:border-amber-400' : 'border-slate-200/50 hover:shadow-md hover:bg-white/80'}`}>
                  
                  {/* Actions on Hover */}
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 z-20">
                    <button 
                       onClick={() => handleEditClick(lot)}
                       className="p-2 bg-white/90 hover:bg-white text-slate-400 hover:text-primary rounded-xl shadow-sm border border-slate-200 transition-all focus:outline-none"
                       title="Modifica Lotto"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                       onClick={() => handleDelete(lot.id)}
                       disabled={deleteMutation.isPending}
                       className="p-2 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl shadow-sm border border-slate-200 transition-all focus:outline-none disabled:opacity-50"
                       title="Elimina Definitivamente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="relative pt-2">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-white/80 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200/60 shadow-sm inline-block">
                        Lotto {lot.lot_number}
                      </span>
                      {isExpired ? (
                        <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm animate-pulse ml-auto">
                          Scaduto
                        </span>
                      ) : (
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm ml-auto ${isCritical ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-rose-100/80 text-rose-700 border border-transparent'}`}>
                          {daysDiff === 0 ? 'Scade Oggi' : `Tra ${daysDiff} giorni`}
                        </span>
                      )}
                    </div>
                     <h3 className="font-bold text-slate-800 text-xl leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2 pr-14">
                      {productName}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-slate-400 mb-5">{productSku}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/50 border border-slate-100 grid grid-cols-2 gap-4 mt-auto">
                    <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 flex items-center gap-1">
                          Scadenza
                        </p>
                        <p className={`font-bold text-sm ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>{expDate.toLocaleDateString('it-IT')}</p>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-4">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Giacenza</p>
                        <p className={`font-black tracking-tight text-lg ${lot.current_quantity < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {lot.current_quantity} <span className="text-xs font-semibold text-slate-400">pz</span>
                        </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

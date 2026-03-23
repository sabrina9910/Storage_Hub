import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Package, Plus, Minus, ShieldAlert, Download, Filter, Calendar, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type ActionType = 'add' | 'remove' | 'quarantine';
type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function Movimenti() {
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<ActionType>('add');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  
  // Filters
  const [period, setPeriod] = useState<PeriodType>('today');
  const [filterType, setFilterType] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (period !== 'custom') {
      params.append('period', period);
    } else if (dateFrom && dateTo) {
      params.append('date_from', dateFrom);
      params.append('date_to', dateTo);
    }
    if (filterType) params.append('type', filterType);
    if (filterUser) params.append('user', filterUser);
    return params.toString();
  };

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: apiServices.getProducts,
  });

  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ['movements', period, filterType, filterUser, dateFrom, dateTo],
    queryFn: () => apiServices.getMovements(buildQueryParams()),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: apiServices.getUsers,
  });

  const addMutation = useMutation({
    mutationFn: apiServices.addStock,
    onSuccess: () => {
      toast.success('Stock aggiunto con successo!');
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante l\'aggiunta dello stock');
    },
  });

  const removeMutation = useMutation({
    mutationFn: apiServices.removeStock,
    onSuccess: () => {
      toast.success('Stock rimosso con successo!');
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante la rimozione dello stock');
    },
  });

  const quarantineMutation = useMutation({
    mutationFn: apiServices.quarantineProduct,
    onSuccess: () => {
      toast.success('Prodotto messo in quarantena!');
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante la quarantena');
    },
  });

  const resetForm = () => {
    setSelectedProduct('');
    setQuantity('');
    setNotes('');
    setReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Seleziona un prodotto');
      return;
    }

    if (activeAction === 'quarantine') {
      quarantineMutation.mutate({ product_id: selectedProduct, reason });
    } else {
      if (!quantity || parseInt(quantity) <= 0) {
        toast.error('Inserisci una quantità valida');
        return;
      }

      const data = {
        product_id: selectedProduct,
        quantity: parseInt(quantity),
        notes,
      };

      if (activeAction === 'add') {
        addMutation.mutate(data);
      } else {
        removeMutation.mutate(data);
      }
    }
  };

  const handleExport = async (e: React.MouseEvent, format: 'xlsx' | 'pdf') => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const params = buildQueryParams();
      const response = await fetch(`http://localhost:8000/api/movements/export/${format}/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movimenti_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Esportazione ${format.toUpperCase()} completata!`);
    } catch (error) {
      toast.error('Errore durante l\'esportazione');
    }
  };

  const productsList = Array.isArray(products?.results) ? products.results : (Array.isArray(products) ? products : []);
  const movementsList = Array.isArray(movements?.results) ? movements.results : (Array.isArray(movements) ? movements : []);
  const usersList = Array.isArray(users?.results) ? users.results : (Array.isArray(users) ? users : []);

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'STOCK_IN': 'Carico',
      'STOCK_OUT': 'Scarico',
      'QUARANTINED': 'Quarantena',
      'IN': 'Carico',
      'OUT': 'Scarico',
      'QUARANTINE': 'Quarantena',
      'RETURN': 'Reso',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Movimenti</h1>
          <p className="text-slate-500 font-medium mt-1">Gestisci le operazioni di magazzino</p>
        </div>
      </div>

      {/* SECTION 1: Actions Panel */}
      <div className="glass-card p-8 rounded-3xl">
        <h2 className="text-2xl font-black text-slate-800 mb-6">Azioni sui Prodotti</h2>
        
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveAction('add')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              activeAction === 'add'
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
            )}
          >
            <Plus size={20} /> Carico
          </button>
          <button
            onClick={() => setActiveAction('remove')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              activeAction === 'remove'
                ? "bg-rose-500 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-rose-50 border border-slate-200"
            )}
          >
            <Minus size={20} /> Scarico
          </button>
          <button
            onClick={() => setActiveAction('quarantine')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              activeAction === 'quarantine'
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-amber-50 border border-slate-200"
            )}
          >
            <ShieldAlert size={20} /> Quarantena
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prodotto</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              required
            >
              <option value="">Seleziona un prodotto...</option>
              {productsList.map((product: any) => (
                <option key={product.id} value={product.id}>
                  [{product.sku}] {product.name}
                </option>
              ))}
            </select>
          </div>

          {activeAction !== 'quarantine' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantità</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Inserisci quantità"
                required
              />
            </div>
          )}

          {activeAction === 'quarantine' ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Motivo Quarantena</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                rows={3}
                placeholder="Descrivi il motivo della quarantena..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Note (opzionale)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                rows={2}
                placeholder="Aggiungi note..."
              />
            </div>
          )}

          <button
            type="submit"
            disabled={addMutation.isPending || removeMutation.isPending || quarantineMutation.isPending}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
              activeAction === 'add' && "bg-emerald-500 hover:bg-emerald-600",
              activeAction === 'remove' && "bg-rose-500 hover:bg-rose-600",
              activeAction === 'quarantine' && "bg-amber-500 hover:bg-amber-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {(addMutation.isPending || removeMutation.isPending || quarantineMutation.isPending) ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Package size={20} />
                {activeAction === 'add' && 'Aggiungi Stock'}
                {activeAction === 'remove' && 'Rimuovi Stock'}
                {activeAction === 'quarantine' && 'Metti in Quarantena'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* SECTION 2: Movements Table with Filters */}
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800">Riepilogo Movimenti</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => handleExport(e, 'xlsx')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Download size={16} /> XLSX
            </button>
            <button
              type="button"
              onClick={(e) => handleExport(e, 'pdf')}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Download size={16} /> PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <Calendar size={14} className="inline mr-1" /> Periodo
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="today">Oggi</option>
              <option value="week">Questa Settimana</option>
              <option value="month">Questo Mese</option>
              <option value="year">Quest'Anno</option>
              <option value="custom">Personalizzato</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Da</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">A</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <Filter size={14} className="inline mr-1" /> Tipo Azione
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Tutti</option>
              <option value="STOCK_IN">Carico</option>
              <option value="STOCK_OUT">Scarico</option>
              <option value="QUARANTINED">Quarantena</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <User size={14} className="inline mr-1" /> Operatore
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Tutti</option>
              {usersList.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {movementsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : movementsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Nessun movimento trovato</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Data e Ora</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Prodotto</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Quantità</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Operatore</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movementsList.map((movement: any) => (
                  <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">
                      {new Date(movement.timestamp).toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">
                      {movement.product_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">
                      {movement.product_sku || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase",
                        movement.movement_type === 'STOCK_IN' || movement.movement_type === 'IN' ? "bg-emerald-100 text-emerald-700" :
                        movement.movement_type === 'STOCK_OUT' || movement.movement_type === 'OUT' ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {getActionTypeLabel(movement.movement_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-black text-slate-800">
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-bold text-slate-800">{movement.user_full_name || movement.user_email || 'N/A'}</div>
                      <div className="text-xs text-slate-500 uppercase">{movement.user_role}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Save, Box } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProductCreateModalProps {
  onClose: () => void;
}

export default function ProductCreateModal({ onClose }: ProductCreateModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit_of_measure: 'pz',
    unit_price: '0.00',
    min_stock_threshold: '10',
    suppliers: [] as string[],
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: apiServices.getCategories });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: () => apiServices.getSuppliers() });

  const safeCats = Array.isArray(categories?.results || categories) ? (categories?.results || categories) : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const createMutation = useMutation({
    mutationFn: (data: any) => apiServices.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Prodotto creato con successo!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante la creazione del prodotto');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Seleziona una categoria');
      return;
    }
    
    // Convert for API
    const pData = {
      ...formData,
      // category is already a UUID string, no need for parseInt
      unit_price: parseFloat(formData.unit_price),
      min_stock_threshold: parseInt(formData.min_stock_threshold),
    };
    
    createMutation.mutate(pData);
  };

  const toggleSupplier = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.suppliers.includes(id);
      if (isSelected) {
        return { ...prev, suppliers: prev.suppliers.filter(s => s !== id) };
      } else {
        return { ...prev, suppliers: [...prev.suppliers, id] };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Box size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Crea Nuovo Prodotto</h3>
              <p className="text-sm font-medium text-slate-500">Aggiungi una referenza al catalogo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="create-product-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SKU */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Codice SKU</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm uppercase"
                  placeholder="EX: PROD-001"
                />
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nome Prodotto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome dell'articolo"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Categoria</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Seleziona una categoria...</option>
                  {safeCats.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* UDM */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Unità di Misura</label>
                <select
                  required
                  value={formData.unit_of_measure}
                  onChange={e => setFormData({...formData, unit_of_measure: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="pz">Pezzi (pz)</option>
                  <option value="kg">Chilogrammi (kg)</option>
                  <option value="lt">Litri (lt)</option>
                  <option value="scatole">Scatole</option>
                  <option value="pallet">Pallet</option>
                </select>
              </div>

              {/* Prezzo */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Prezzo Unitario (€)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={e => setFormData({...formData, unit_price: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                />
              </div>

              {/* Soglia */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Soglia Minima Allarme</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.min_stock_threshold}
                  onChange={e => setFormData({...formData, min_stock_threshold: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                />
              </div>
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Descrizione Operativa</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Note, temperature di conservazione, o policy aziendali..."
              />
            </div>

            {/* Fornitori (Checkbox grid) */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Fornitori Abilitati</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {safeSuppliers.map((supplier: any) => {
                  const isChecked = formData.suppliers.includes(supplier.id);
                  return (
                    <label 
                      key={supplier.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-primary/5 border-primary text-primary' : 'bg-white/50 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-300"
                        checked={isChecked}
                        onChange={() => toggleSupplier(supplier.id)}
                      />
                      <span className="text-sm font-bold line-clamp-1">{supplier.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold bg-white rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
          >
            Annulla
          </button>
          <button 
            type="submit" 
            form="create-product-form"
            disabled={createMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            {createMutation.isPending ? 'Salvataggio...' : <><Save size={18} /> Salva Prodotto</>}
          </button>
        </div>

      </div>
    </div>
  );
}

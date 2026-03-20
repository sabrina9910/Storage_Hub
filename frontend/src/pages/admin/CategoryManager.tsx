import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoryManager() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data: categories, isLoading } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: apiServices.getCategories 
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiServices.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria creata con successo');
      setIsAdding(false);
      setFormData({ name: '', description: '' });
    },
    onError: () => toast.error('Errore durante la creazione')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiServices.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria aggiornata');
      setEditingId(null);
    },
    onError: () => toast.error('Errore durante l\'aggiornamento')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria eliminata');
    },
    onError: () => toast.error('Impossibile eliminare una categoria in uso')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (cat: any) => {
    setFormData({ name: cat.name, description: cat.description || '' });
    setEditingId(cat.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare la categoria "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500">Caricamento Categorie...</div>;

  const safeCats = Array.isArray(categories?.results || categories) ? (categories?.results || categories) : [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Categorie</h2>
          <p className="text-slate-500 font-medium mt-1">Gestisci le macro-sezioni alimentari del magazzino.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({name:'', description:''}); }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={20} /> Nuova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista Categorie */}
        <div className="lg:col-span-2 space-y-4">
          {safeCats.map((cat: any) => (
            <div key={cat.id} className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all hover:bg-white/80 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Tags size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{cat.name}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{cat.description || 'Nessuna descrizione'}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(cat)}
                  className="p-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {safeCats.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-400">
              <p>Nessuna categoria configurata.</p>
            </div>
          )}
        </div>

        {/* Form Creazione/Modifica */}
        {isAdding && (
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-32 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                {editingId ? <><Edit2 size={20} className="text-primary"/> Modifica Categoria</> : <><Plus size={20} className="text-primary"/> Crea Categoria</>}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="es. Latticini"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Descrizione</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Descrizione opzionale..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                    className="flex-1 py-3 text-slate-500 focus:outline-none font-bold bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
                  >
                    Salva
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

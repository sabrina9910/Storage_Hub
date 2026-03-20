import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { apiServices } from '@/lib/api';
import { ArrowLeft, Edit2, Save, X, Building2, User, Phone, Mail, Globe, MapPin, CreditCard, FileText, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => apiServices.getSupplier(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiServices.updateSupplier(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornitore aggiornato con successo');
      setIsEditing(false);
    },
    onError: () => toast.error('Errore durante l\'aggiornamento'),
  });

  const handleEdit = () => {
    setFormData(supplier);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (isLoading) return <div className="p-8 text-slate-500">Caricamento...</div>;
  if (!supplier) return <div className="p-8 text-slate-500">Fornitore non trovato</div>;

  const displayData = isEditing ? formData : supplier;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/suppliers')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{displayData.name}</h2>
            <p className="text-slate-500 font-medium mt-1">Dettagli Fornitore</p>
          </div>
        </div>
        {!isEditing ? (
          <button onClick={handleEdit} className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Edit2 size={18} /> Modifica
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={handleCancel} className="py-2.5 px-6 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2">
              <X size={18} /> Annulla
            </button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50">
              <Save size={18} /> {updateMutation.isPending ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Building2 size={14} /> Informazioni Azienda
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome" icon={<Building2 size={16} />} value={displayData.name} isEditing={isEditing} onChange={(v) => setFormData({...formData, name: v})} />
              <Field label="Ragione Sociale" icon={<Building2 size={16} />} value={displayData.business_name} isEditing={isEditing} onChange={(v) => setFormData({...formData, business_name: v})} />
              <Field label="P.IVA" icon={<FileText size={16} />} value={displayData.vat_number} isEditing={isEditing} onChange={(v) => setFormData({...formData, vat_number: v})} />
              <Field label="Sito Web" icon={<Globe size={16} />} value={displayData.website} isEditing={isEditing} onChange={(v) => setFormData({...formData, website: v})} />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={14} /> Contatti
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Referente" icon={<User size={16} />} value={displayData.contact_person} isEditing={isEditing} onChange={(v) => setFormData({...formData, contact_person: v})} />
              <Field label="Email" icon={<Mail size={16} />} value={displayData.email} isEditing={isEditing} onChange={(v) => setFormData({...formData, email: v})} type="email" />
              <Field label="Telefono" icon={<Phone size={16} />} value={displayData.phone} isEditing={isEditing} onChange={(v) => setFormData({...formData, phone: v})} />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={14} /> Indirizzo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Via" icon={<MapPin size={16} />} value={displayData.address_street} isEditing={isEditing} onChange={(v) => setFormData({...formData, address_street: v})} />
              </div>
              <Field label="Città" value={displayData.address_city} isEditing={isEditing} onChange={(v) => setFormData({...formData, address_city: v})} />
              <Field label="CAP" value={displayData.address_zip} isEditing={isEditing} onChange={(v) => setFormData({...formData, address_zip: v})} />
              <Field label="Paese" value={displayData.address_country} isEditing={isEditing} onChange={(v) => setFormData({...formData, address_country: v})} />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CreditCard size={14} /> Condizioni Pagamento
            </h3>
            <Field label="Termini" value={displayData.payment_terms} isEditing={isEditing} onChange={(v) => setFormData({...formData, payment_terms: v})} />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={14} /> Note
            </h3>
            <Field label="Commenti" value={displayData.notes} isEditing={isEditing} onChange={(v) => setFormData({...formData, notes: v})} multiline />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package size={14} /> Prodotti Associati
            </h3>
            {supplier.products && supplier.products.length > 0 ? (
              <div className="space-y-2">
                {supplier.products.map((product: any) => (
                  <div key={product.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-mono text-slate-400">{product.sku}</div>
                    <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                    <div className="text-xs text-slate-500">€{Number(product.unit_price).toFixed(2)} / {product.unit_of_measure}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 text-center py-4">Nessun prodotto associato</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, value, isEditing, onChange, type = 'text', multiline = false }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
            rows={4}
          />
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
          />
        )
      ) : (
        <div className="text-slate-800 font-medium py-2">{value || '-'}</div>
      )}
    </div>
  );
}

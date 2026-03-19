import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiServices } from '@/lib/api';
import { 
  UserCircle, Mail, Shield, KeyRound, Loader2, 
  Camera, Calendar, Briefcase, Phone, Activity, 
  Trash2, AlertTriangle, Save 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  hire_date?: string;
  contract_type?: string;
  role: string;
  is_superuser: boolean;
  avatar?: string;
}

interface UserStats {
  total_movements: number;
  role: string;
}

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<'anagrafica' | 'sicurezza' | 'statistiche'>('anagrafica');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Anagrafica form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    hire_date: '',
    contract_type: ''
  });

  // Password form state
  const [passData, setPassData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery<UserData>({ 
    queryKey: ['currentUser'], 
    queryFn: apiServices.getCurrentUser
  });

  const { data: userStats, isLoading: isStatsLoading } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: apiServices.getUserStats,
    enabled: activeTab === 'statistiche'
  });

  const updateProfileMutation = useMutation({
    mutationFn: apiServices.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profilo aggiornato con successo!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante l\'aggiornamento del profilo');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: apiServices.changePassword,
    onSuccess: () => {
      toast.success('Password aggiornata con successo! Effettua nuovamente l\'accesso.');
      setPassData({ old_password: '', new_password: '', confirm_password: '' });
      apiServices.logout();
      navigate('/login');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante il cambio password');
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => apiServices.deleteUser(id),
    onSuccess: () => {
      toast.success('Account eliminato definitivamente.');
      apiServices.logout();
      navigate('/login');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante l\'eliminazione dell\'account');
      setIsDeleteModalOpen(false);
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formPayload = new FormData();
      formPayload.append('avatar', file);
      
      const loadingToast = toast.loading('Caricamento immagine in corso...');
      updateProfileMutation.mutate(formPayload, {
        onSuccess: () => {
          toast.dismiss(loadingToast);
        },
        onError: () => {
          toast.dismiss(loadingToast);
        }
      });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      toast.error('Le nuove password non coincidono');
      return;
    }
    changePasswordMutation.mutate({
      old_password: passData.old_password,
      new_password: passData.new_password
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser) return null;
  
  if (!formData.email && currentUser.email) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        birth_date: currentUser.birth_date || '',
        hire_date: currentUser.hire_date || '',
        contract_type: currentUser.contract_type || ''
      });
  }

  const roleName = currentUser.is_superuser ? 'Superuser' : currentUser.role === 'amministratore' ? 'Amministratore' : 'Magazziniere';
  const roleColor = currentUser.is_superuser 
    ? 'text-purple-600 bg-purple-100 border-purple-200' 
    : currentUser.role === 'amministratore' 
      ? 'text-blue-600 bg-blue-100 border-blue-200' 
      : 'text-emerald-600 bg-emerald-100 border-emerald-200';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8">
      
      {/* Profilo Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative group">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center font-bold text-5xl shadow-xl border-4 border-white">
              {currentUser.first_name ? currentUser.first_name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
            </div>
          )}
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-3 bg-white rounded-full text-primary shadow-lg hover:scale-110 transition-transform border border-slate-100 group-hover:bg-primary group-hover:text-white"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <div className="text-center md:text-left relative z-10 flex-1">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            {currentUser.first_name || currentUser.last_name ? `${currentUser.first_name} ${currentUser.last_name}` : 'Profilo Utente'}
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">{currentUser.email}</p>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full border ${roleColor} font-bold text-sm shadow-sm mt-4`}>
            {roleName}
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200/50 gap-8">
        {[
          { id: 'anagrafica', icon: UserCircle, label: 'Anagrafica' },
          { id: 'sicurezza', icon: Shield, label: 'Sicurezza & Accessi' },
          { id: 'statistiche', icon: Activity, label: 'Statistiche' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 flex items-center gap-2 font-semibold text-sm transition-all relative ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="glass-card p-8">
        
        {/* TAB ANAGRAFICA */}
        {activeTab === 'anagrafica' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50" 
                    placeholder="Il tuo nome"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cognome</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50" 
                    placeholder="Il tuo cognome"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Indirizzo Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none transition-all bg-slate-50 text-slate-500 cursor-not-allowed" 
                    disabled
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">L'indirizzo email non puo' essere modificato direttamente.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Telefono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50" 
                    placeholder="+39 333 1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data di Nascita</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="date" 
                    value={formData.birth_date}
                    onChange={e => setFormData({...formData, birth_date: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipologia Contratto</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select 
                    value={formData.contract_type}
                    onChange={e => setFormData({...formData, contract_type: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50 appearance-none" 
                  >
                    <option value="">Seleziona...</option>
                    <option value="Indeterminato">Tempo Indeterminato</option>
                    <option value="Determinato">Tempo Determinato</option>
                    <option value="Stage">Stage / Tirocinio</option>
                    <option value="Collaborazione">Collaborazione Esterna</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salva Modifiche
              </button>
            </div>
          </form>
        )}

        {/* TAB SICUREZZA E AZIONI */}
        {activeTab === 'sicurezza' && (
          <div className="space-y-12 animate-in fade-in">
            {/* Cambio Password */}
            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <KeyRound className="text-primary w-6 h-6" /> Modifica Password
              </h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vecchia Password</label>
                <input 
                  type="password" 
                  required
                  value={passData.old_password}
                  onChange={e => setPassData({...passData, old_password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nuova Password</label>
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={passData.new_password}
                  onChange={e => setPassData({...passData, new_password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Conferma Nuova Password</label>
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={passData.confirm_password}
                  onChange={e => setPassData({...passData, confirm_password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-error focus:border-error outline-none transition-all bg-white/50" 
                />
              </div>

              <button 
                type="submit" 
                disabled={changePasswordMutation.isPending}
                className="btn-outline w-full flex items-center justify-center gap-2 py-3 mt-4"
              >
                {changePasswordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                Aggiorna Password
              </button>
            </form>

            <div className="border-t border-slate-200/50 pt-8">
              <div className="bg-error/5 border border-error/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-error">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-error font-bold text-lg">Zona Pericolosa</h4>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed max-w-xl">
                    L'eliminazione dell'account è permanente e irreversibile. Tutte le tue azioni e referenze a questo account 
                    rimarranno nei log per scopi di auditing, ma non potrai più accedere.
                  </p>
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="mt-6 bg-error hover:bg-error-dark text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-error/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" /> Elimina Definitivamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB STATISTICHE */}
        {activeTab === 'statistiche' && (
          <div className="animate-in fade-in space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Activity className="text-primary w-6 h-6" /> Riepilogo Operatività
            </h3>

            {isStatsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Movimenti Effettuati</p>
                  <p className="text-4xl font-black text-slate-800 mt-2">{userStats?.total_movements || 0}</p>
                </div>
                
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Livello Utente</p>
                  <p className="text-xl font-black text-slate-800 mt-2 uppercase">{userStats?.role}</p>
                </div>

                <div className="bg-white/60 border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Stato Accesso</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-lg font-black text-slate-800">Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Sei assolutamente sicuro?</h3>
            <p className="text-slate-500 text-center mb-8 leading-relaxed">
              Questa azione non può essere annullata. L'account verrà disattivato irrimediabilmente e verrai disconnesso all'istante.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={deleteAccountMutation.isPending}
              >
                Annulla
              </button>
              <button 
                onClick={() => deleteAccountMutation.mutate(currentUser.id)}
                disabled={deleteAccountMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-error hover:bg-error-dark shadow-lg shadow-error/30 transition-all flex items-center justify-center"
              >
                {deleteAccountMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sì, Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiServices } from '@/lib/api';
import { User, Mail, Lock, Save, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [emailData, setEmailData] = useState({
    new_email: '',
    confirm_email: ''
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: apiServices.getCurrentUser,
  });
  const user: any = userData;

  const updateEmailMutation = useMutation({
    mutationFn: (email: string) => apiServices.updateProfile({ email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Email aggiornata con successo!');
      setEmailData({ new_email: '', confirm_email: '' });
    },
    onError: () => toast.error('Errore durante l\'aggiornamento dell\'email'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: apiServices.changePassword,
    onSuccess: () => {
      toast.success('Password aggiornata! Effettua nuovamente l\'accesso.');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => {
        apiServices.logout();
        navigate('/login');
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Errore durante il cambio password');
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailData.new_email !== emailData.confirm_email) {
      toast.error('Le email non coincidono');
      return;
    }
    updateEmailMutation.mutate(emailData.new_email);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Le nuove password non coincidono');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('La password deve avere almeno 8 caratteri');
      return;
    }
    changePasswordMutation.mutate({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    });
  };

  if (isLoading) return <div className="p-8 text-slate-500">Caricamento...</div>;
  if (!user) return null;

  const roleName = user.is_superuser ? 'Superuser' : user.role === 'amministratore' ? 'Amministratore' : 'Magazziniere';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Il Mio Profilo</h2>
          <p className="text-slate-500 font-medium mt-1">Gestisci le tue informazioni personali</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User size={14} /> Informazioni Utente
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Utente</label>
              <div className="text-slate-800 font-medium py-2">
                {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Non impostato'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <div className="text-slate-800 font-medium py-2">{user.email}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ruolo</label>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">
                <Shield size={14} />
                {roleName}
              </div>
            </div>
          </div>
        </div>

        {/* Change Email */}
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Mail size={14} /> Modifica Email
          </h3>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nuova Email</label>
              <input
                type="email"
                value={emailData.new_email}
                onChange={(e) => setEmailData({ ...emailData, new_email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                placeholder="nuova@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Conferma Email</label>
              <input
                type="email"
                value={emailData.confirm_email}
                onChange={(e) => setEmailData({ ...emailData, confirm_email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                placeholder="nuova@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updateEmailMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {updateEmailMutation.isPending ? 'Aggiornamento...' : 'Aggiorna Email'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Lock size={14} /> Modifica Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password Attuale</label>
              <input
                type="password"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nuova Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Conferma Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock size={18} />
              {changePasswordMutation.isPending ? 'Aggiornamento...' : 'Aggiorna Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

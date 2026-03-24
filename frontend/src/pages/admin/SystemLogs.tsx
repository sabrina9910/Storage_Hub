import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Users, Activity, Plus, X, Save, Shield, Mail, User, Phone, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SystemLogs() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'magazziniere',
    password: ''
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: apiServices.getUsers,
  });

  const { data: loginLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['loginLogs'],
    queryFn: apiServices.getLoginLogs,
    enabled: activeTab === 'logs',
  });

  const createUserMutation = useMutation({
    mutationFn: apiServices.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utente creato con successo');
      setIsAddUserModalOpen(false);
      setNewUser({ email: '', first_name: '', last_name: '', phone: '', role: 'magazziniere', password: '' });
    },
    onError: () => toast.error('Errore durante la creazione dell\'utente'),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiServices.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utente aggiornato con successo');
      setIsEditUserModalOpen(false);
      setEditingUser(null);
    },
    onError: () => toast.error('Errore durante l\'aggiornamento dell\'utente'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: apiServices.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utente eliminato con successo');
    },
    onError: () => toast.error('Errore durante l\'eliminazione dell\'utente'),
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      toast.error('Email e password sono obbligatori');
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleEditUser = (user: any) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.email) {
      toast.error('Email è obbligatoria');
      return;
    }
    const { id, ...data } = editingUser;
    updateUserMutation.mutate({ id, data });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Logs & Users</h2>
          <p className="text-slate-500 font-medium mt-1">Gestione utenti e log di sistema</p>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Aggiungi Utente
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/50 gap-8 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 flex items-center gap-2 font-semibold text-sm transition-all relative ${
            activeTab === 'users' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5" />
          Gestione Utenti
          {activeTab === 'users' && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-4 flex items-center gap-2 font-semibold text-sm transition-all relative ${
            activeTab === 'logs' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Activity className="w-5 h-5" />
          Log Accessi
          {activeTab === 'logs' && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
          )}
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          {usersLoading ? (
            <div className="p-8 text-center text-slate-500">Caricamento...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Telefono</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Ruolo</th>
                    <th className="text-right p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user: any) => (
                      <tr key={user.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">
                            {user.first_name || user.last_name
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'Non impostato'}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">{user.email}</td>
                        <td className="p-4 text-slate-600">{user.phone || '-'}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              user.is_superuser || user.role === 'amministratore'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Shield size={12} />
                            {user.is_superuser || user.role === 'amministratore' ? 'Amministratore' : 'Magazziniere'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifica utente"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Elimina utente"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Nessun utente trovato
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Login Logs Tab */}
      {activeTab === 'logs' && (
        <div className="glass-card overflow-hidden">
          {logsLoading ? (
            <div className="p-8 text-center text-slate-500">Caricamento...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Data/Ora</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Utente</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Ruolo</th>
                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(loginLogs) && loginLogs.length > 0 ? (
                    loginLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-4 text-slate-600 font-mono text-sm">{formatDate(log.timestamp)}</td>
                        <td className="p-4 font-bold text-slate-800">{log.user_name}</td>
                        <td className="p-4 text-slate-600">{log.user_email}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-slate-500 uppercase">{log.user_role}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-sm">{log.ip_address || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Nessun log di accesso trovato
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card bg-white/90 p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Nuovo Utente</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cognome</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Telefono</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ruolo</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                >
                  <option value="magazziniere">Magazziniere</option>
                  <option value="amministratore">Amministratore</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  minLength={8}
                  required
                />
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {createUserMutation.isPending ? 'Creazione...' : 'Crea Utente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card bg-white/90 p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Modifica Utente</h3>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome</label>
                  <input
                    type="text"
                    value={editingUser.first_name}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cognome</label>
                  <input
                    type="text"
                    value={editingUser.last_name}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Telefono</label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ruolo</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white transition-all"
                >
                  <option value="magazziniere">Magazziniere</option>
                  <option value="amministratore">Amministratore</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {updateUserMutation.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

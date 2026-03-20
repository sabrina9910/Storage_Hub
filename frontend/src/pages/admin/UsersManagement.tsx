import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Users, Trash2, Search, Loader2, UserX, ShieldAlert, Edit2, ShieldCheck, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ['usersList'],
    queryFn: apiServices.getUsers,
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ['currentUser'],
    queryFn: apiServices.getCurrentUser,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string | number) => apiServices.deleteUser(id),
    onSuccess: () => {
      toast.success('Utente eliminato con successo dal sistema.');
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      setDeleteUserId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante la rimozione dell\'utente');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => apiServices.updateUser(id, { role }),
    onSuccess: () => {
      toast.success('Ruolo utente aggiornato!');
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Errore durante l\'aggiornamento del ruolo');
    }
  });

  const filteredUsers = users?.filter((u: any) => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-40">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Gestione Staff
          </h1>
          <p className="text-slate-500 font-medium">Visualizza e gestisci le anagrafiche, i ruoli e gli accessi dei dipendenti.</p>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Cerca dipendente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm bg-white/60 backdrop-blur-md"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden mt-6">
        {(filteredUsers ?? []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-sm font-bold uppercase tracking-wider">
                  <th className="p-5 font-bold">Dipendente</th>
                  <th className="p-5 font-bold">Contatti</th>
                  <th className="p-5 font-bold">Ruolo Operativo</th>
                  <th className="p-5 font-bold text-center">Stato</th>
                  <th className="p-5 font-bold text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {(filteredUsers ?? []).map((user: any) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        {user.avatar ? (
                          <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="Avatar" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold shadow-sm border-2 border-white text-lg">
                            {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 text-lg">
                            {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Utente Senza Nome'}
                          </p>
                          <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            Assunto il: {user.hire_date || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-5 space-y-2 focus-within:relative">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {user.phone || '--'}
                        </div>
                    </td>
                    
                    <td className="p-5">
                      <select 
                        className={`text-sm font-bold form-select appearance-none pl-4 pr-8 py-1.5 rounded-full border shadow-sm outline-none transition-all ${
                          user.is_superuser 
                            ? 'bg-purple-100 text-purple-700 border-purple-200 cursor-not-allowed'
                            : user.role === 'amministratore'
                                ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 cursor-pointer'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 cursor-pointer'
                        }`}
                        value={user.is_superuser ? 'superuser' : user.role}
                        disabled={user.is_superuser || user.id === currentUser?.id}
                        onChange={(e) => updateRoleMutation.mutate({ id: user.id, role: e.target.value })}
                      >
                        {user.is_superuser ? (
                            <option value="superuser">Superuser Sistema</option>
                        ) : (
                            <>
                                <option value="amministratore">Amministratore</option>
                                <option value="magazziniere">Magazziniere</option>
                            </>
                        )}
                      </select>
                    </td>

                    <td className="p-5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Attivo
                        </div>
                    </td>
                    
                    <td className="p-5 text-right">
                      {!user.is_superuser && user.id !== currentUser?.id && (
                        <button 
                          onClick={() => setDeleteUserId(user.id)}
                          className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                          title="Licenzia / Elimina Account"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Nessun dipendente trovato</h3>
            <p className="text-slate-500">Prova a modificare i termini di ricerca.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Eliminare Dipendente?</h3>
            <p className="text-slate-500 text-center mb-8 leading-relaxed">
              Il dipendente perderà immediatamente l'accesso al pannello. L'azione è distruttiva e irreversibile. Tutte le referenze passate verranno mantenute nel log.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteUserId(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={deleteUserMutation.isPending}
              >
                Annulla
              </button>
              <button 
                onClick={() => deleteUserMutation.mutate(deleteUserId)}
                disabled={deleteUserMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-error hover:bg-error-dark shadow-lg shadow-error/30 transition-all flex items-center justify-center gap-2"
              >
                {deleteUserMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                Rimuovi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

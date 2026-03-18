import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { UserCircle, Mail, Shield, KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { data: currentUser, isLoading, error } = useQuery({ 
    queryKey: ['currentUser'], 
    queryFn: apiServices.getCurrentUser 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-error">
        Errore nel caricamento del profilo utente.
      </div>
    );
  }

  const roleName = currentUser.is_superuser 
    ? 'Superuser / Amministratore di Sistema' 
    : currentUser.is_admin 
      ? 'Manager / Supervisore' 
      : 'Magazziniere / Operatore';
      
  const roleColor = currentUser.is_superuser 
    ? 'text-purple-600 bg-purple-100 border-purple-200' 
    : currentUser.is_admin 
      ? 'text-blue-600 bg-blue-100 border-blue-200' 
      : 'text-emerald-600 bg-emerald-100 border-emerald-200';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-6">
      
      {/* Header Profilo */}
      <div className="glass-card p-8 relative overflow-hidden flex items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center font-bold text-4xl shadow-xl border-4 border-white">
          {currentUser.email.charAt(0).toUpperCase()}
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Il tuo Profilo</h1>
          <p className="text-slate-500 font-medium">Gestisci le tue credenziali e verifica i tuoi permessi.</p>
        </div>
      </div>

      {/* Dettagli Utente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-6 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <UserCircle className="text-primary w-5 h-5" /> Dati Anagrafici
                </h3>
                
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indirizzo Email</label>
                        <div className="flex items-center gap-3 mt-1 bg-white/50 p-3 rounded-xl border border-slate-100">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-800 font-medium">{currentUser.email}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={() => toast('Funzione Cambio Email in arrivo!', { icon: '🚧' })}
                className="w-full btn-secondary flex items-center justify-center gap-2 mt-4"
            >
                Richiedi Cambio Email
            </button>
        </div>

        <div className="glass-card p-6 space-y-6 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Shield className="text-primary w-5 h-5" /> Livello di Accesso
                </h3>
                
                <div className="mt-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ruolo Attuale</label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full border ${roleColor} font-bold text-sm shadow-sm`}>
                        {roleName}
                    </div>
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                        {currentUser.is_superuser && 'Hai accesso totale al sistema, ai file di log e alle configurazioni di sicurezza.'}
                        {currentUser.is_admin && !currentUser.is_superuser && 'Puoi supervisionare il magazzino e accedere alla Dashboard analitica e ai report.'}
                        {currentUser.is_warehouse_worker && !currentUser.is_admin && !currentUser.is_superuser && 'Puoi gestire l\'intero inventario, movimentare merci e gestire il catalogo senza accedere ai report finanziari.'}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={() => toast('Funzione Cambio Password in arrivo!', { icon: '🚧' })}
                className="w-full btn-outline flex items-center justify-center gap-2 mt-4"
            >
                <KeyRound className="w-4 h-4" /> Modifica Password
            </button>
        </div>
      </div>
    </div>
  );
}

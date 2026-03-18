import { useEffect, useState } from 'react';
import { User, LogOut, Settings, HelpCircle, ShieldCheck } from 'lucide-react';
import { apiServices } from '@/lib/api';

export default function WorkerProfile() {
  const [userEmail, setUserEmail] = useState<string>('caricamento...');
  const [userName, setUserName] = useState<string>('Magazziniere');

  useEffect(() => {
    apiServices.getCurrentUser().then(user => {
      if (user.email) {
        setUserEmail(user.email);
        const namePart = user.email.split('@')[0];
        setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    apiServices.logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profilo Utente</h1>
        <p className="text-slate-500 font-medium mt-1">Gestisci il tuo account e le preferenze.</p>
      </header>

      {/* Profile Card */}
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center bg-white/60 relative overflow-hidden">
        <div className="absolute top-0 w-full h-24 bg-gradient-to-br from-primary/20 to-transparent"></div>
        
        <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-primary z-10 border-4 border-white mb-4">
          <User size={40} className="text-primary/80" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 z-10">{userName}</h2>
        <p className="text-slate-500 font-medium z-10 mb-2">{userEmail}</p>
        
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 z-10">
          <ShieldCheck size={14} />
          Operatore Magazzino
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 px-1">Impostazioni</h3>
        
        <button className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/80 transition-colors active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <span className="font-semibold text-slate-700">Preferenze App</span>
          </div>
        </button>

        <button className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/80 transition-colors active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <span className="font-semibold text-slate-700">Manuale Operativo</span>
          </div>
        </button>
      </div>

      <div className="pt-6">
        <button 
          onClick={handleLogout}
          className="w-full auth-btn bg-error/10 text-error hover:bg-error/20 flex justify-center items-center gap-2 shadow-none border border-error/20"
        >
          <LogOut size={20} />
          Esci dall'Account
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">StorageHub v1.0.0</p>
      </div>
    </div>
  );
}

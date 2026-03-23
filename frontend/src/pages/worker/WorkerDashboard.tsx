import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Clock, Activity, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import QuarantineWidget from '@/components/admin/QuarantineWidget';

export default function WorkerDashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: apiServices.getCurrentUser,
  });

  const { data: movements } = useQuery({
    queryKey: ['movements'],
    queryFn: () => apiServices.getMovements(),
  });

  const safeMovements = Array.isArray(movements?.results || movements) ? (movements?.results || movements) : [];
  const myMovements = safeMovements.filter((m: any) => m.user === user?.id);
  const todayMovements = myMovements.filter((m: any) => new Date(m.timestamp).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-3xl flex flex-col xl:flex-row items-center justify-between gap-8 bg-gradient-to-br from-white/80 to-white/40">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
            Bentornato, {user?.email?.split('@')[0] || 'Operatore'}!
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Il tuo spazio di lavoro operativo
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/60 p-6 rounded-2xl shadow-inner border border-white/50 w-full xl:w-auto justify-center">
          <Clock className="w-12 h-12 text-primary/80" />
          <div>
            <div className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums">
              {format(time, 'HH:mm:ss')}
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
              {format(time, 'EEEE d MMMM yyyy', { locale: it })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-3xl col-span-1 flex flex-col justify-center items-center text-center bg-primary/5 border-primary/10">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-primary/10">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Movimenti di Oggi</h3>
          <p className="text-7xl font-black text-primary mt-2">{todayMovements.length}</p>
          <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed px-4">
            operazioni registrate con successo durante il tuo turno attuale
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl lg:col-span-2">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg"><ArrowLeftRight className="w-5 h-5 text-slate-600" /></div>
            Le Tue Ultime Transazioni
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="pb-4 pt-2 font-semibold text-slate-500 uppercase tracking-wider text-xs">Ora</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-500 uppercase tracking-wider text-xs">Prodotto / Lotto</th>
                  <th className="pb-4 pt-2 font-semibold text-slate-500 uppercase tracking-wider text-xs">Tipo</th>
                  <th className="pb-4 pt-2 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Quantità</th>
                </tr>
              </thead>
              <tbody>
                {myMovements.slice(0, 6).map((m: any) => (
                  <tr key={m.id} className="border-b border-glass-border/40 hover:bg-white/60 transition-colors group">
                    <td className="py-4 pr-4">
                      <div className="text-slate-700 font-bold tabular-nums bg-slate-100 px-2.5 py-1 rounded inline-block">
                        {format(new Date(m.timestamp), 'HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-800 text-base">{m.lot_details?.product_name || `Lotto ${m.lot}`}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1 bg-white/50 inline-block px-1.5 rounded">{m.lot_details?.lot_number || `ID ${m.lot.substring(0,8)}`}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
                        m.movement_type === 'IN' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        m.movement_type === 'OUT' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        m.movement_type === 'QUARANTINE' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className={`font-black tabular-nums text-xl ${
                        m.movement_type === 'OUT' || m.movement_type === 'QUARANTINE' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {m.movement_type === 'OUT' || m.movement_type === 'QUARANTINE' ? '-' : '+'}{m.quantity}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {myMovements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="inline-flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <ArrowLeftRight className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium tracking-wide">Nessuna transazione recente trovata.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <QuarantineWidget />
      </div>
    </div>
  );
}

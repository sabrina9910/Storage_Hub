import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentMovementsProps {
  limit?: number;
}

export default function RecentMovements({ limit = 10 }: RecentMovementsProps) {
  const { data: recentLogs, isLoading } = useQuery({
    queryKey: ['recentAuditLogs', limit],
    queryFn: () => apiServices.getAuditLogs(`limit=${limit}`),
  });

  const logsList = Array.isArray(recentLogs) ? recentLogs : [];

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'STOCK_IN': 'Carico',
      'STOCK_OUT': 'Scarico',
      'BLACKLISTED': 'Blacklist',
      'RESTORED': 'Ripristinato',
      'QUARANTINED': 'Quarantena',
      'ORDER_CREATED': 'Ordine',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'STOCK_IN': 'bg-emerald-100 text-emerald-700',
      'STOCK_OUT': 'bg-rose-100 text-rose-700',
      'BLACKLISTED': 'bg-slate-100 text-slate-700',
      'RESTORED': 'bg-blue-100 text-blue-700',
      'QUARANTINED': 'bg-amber-100 text-amber-700',
      'ORDER_CREATED': 'bg-purple-100 text-purple-700',
    };
    return colors[action] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="glass-card p-6 rounded-3xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-4">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 border border-indigo-500/20">
          <Clock size={22} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Movimenti Recenti</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : logsList.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nessun movimento recente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logsList.map((log: any) => (
            <div
              key={log.id}
              className="bg-white/70 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-black uppercase",
                      getActionColor(log.action_type)
                    )}>
                      {getActionLabel(log.action_type)}
                    </span>
                    {log.quantity > 0 && (
                      <span className="text-xs font-bold text-slate-600">
                        Qtà: {log.quantity}
                      </span>
                    )}
                  </div>
                  
                  <div className="font-bold text-slate-800 truncate mb-1">
                    {log.product_name}
                  </div>
                  
                  <div className="text-xs text-slate-500 font-mono mb-2">
                    SKU: {log.product_sku}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-slate-600">
                      {log.user_full_name}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 uppercase font-bold">
                      {log.user_role}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleDateString('it-IT')}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              {log.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  {log.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

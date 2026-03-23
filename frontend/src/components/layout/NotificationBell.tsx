import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, AlertTriangle, Package, CheckCircle, ShieldAlert } from 'lucide-react';
import { apiServices } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AlertItem {
  id: string | number;
  sku: string;
  name: string;
  uid?: string;
  [key: string]: string | number | boolean | undefined;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('seenAlertIds');
    return saved ? JSON.parse(saved) : [];
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['allAlerts'],
    queryFn: apiServices.getAlerts,
    refetchInterval: 30000,
  });

  const lowStock = alerts?.low_stock || [];
  const quarantine = alerts?.quarantine || [];
  
  // Create unique IDs for mapping/tracking
  const currentAlerts: AlertItem[] = [
    ...lowStock.map((a: AlertItem) => ({ ...a, uid: `ls-${a.id}` })),
    ...quarantine.map((a: AlertItem) => ({ ...a, uid: `q-${a.id}` }))
  ];

  // Count only those not in seenIds
  const unseenCount = currentAlerts.filter(a => !seenIds.includes(a.uid)).length;

  useEffect(() => {
    if (isOpen && currentAlerts.length > 0) {
      const allIds = currentAlerts.map(a => a.uid).filter(Boolean) as string[];
      // We only update if there are new IDs to add
      const newSeen = Array.from(new Set([...seenIds, ...allIds]));
      if (newSeen.length !== seenIds.length) {
        setSeenIds(newSeen);
        localStorage.setItem('seenAlertIds', JSON.stringify(newSeen));
      }
    }
  }, [isOpen, currentAlerts, seenIds]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-full transition-all duration-300 group hover:bg-slate-100 border border-transparent",
          isOpen ? "bg-slate-100 text-primary border-slate-200" : "text-slate-500"
        )}
      >
        <Bell size={22} className={cn("transition-transform duration-300", isOpen && "rotate-12")} />
        {unseenCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center border border-white shadow-sm animate-in zoom-in duration-300">
            {unseenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-card shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 origin-top-right">
          <div className="p-4 border-b border-glass-border/50 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Notifiche di Sistema</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Caricamento...</div>
            ) : currentAlerts.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle size={32} className="text-success mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-slate-500">Nessun alert attivo</p>
              </div>
            ) : (
              <div className="divide-y divide-glass-border/20">
                {currentAlerts.map((p: AlertItem) => {
                  const isUnseen = !seenIds.includes(p.uid || '');
                  const isQuarantine = p.uid?.startsWith('q-');
                  
                  return (
                    <Link
                      key={p.uid}
                      to={`/admin/products?sku=${p.sku}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-4 transition-colors group relative",
                        isUnseen ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"
                      )}
                    >
                      {isUnseen && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        isQuarantine ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {isQuarantine ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-wider mb-0.5",
                          isQuarantine ? "text-rose-500" : "text-amber-500"
                        )}>
                          {isQuarantine ? 'Prodotto in quarantena' : 'Prodotto sotto scorta'}
                        </p>
                        <p className={cn("text-sm font-bold truncate max-w-[180px]", isUnseen ? "text-slate-900" : "text-slate-600")}>
                          {p.name}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

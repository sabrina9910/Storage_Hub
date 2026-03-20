import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import { FileText, Filter, Calendar, User, Package, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function AuditLog() {
  const [period, setPeriod] = useState<PeriodType>('today');
  const [filterUser, setFilterUser] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (period !== 'custom') {
      params.append('period', period);
    } else if (dateFrom && dateTo) {
      params.append('date_from', dateFrom);
      params.append('date_to', dateTo);
    }
    if (filterUser) params.append('user', filterUser);
    if (filterProduct) params.append('product', filterProduct);
    if (filterAction) params.append('action_type', filterAction);
    return params.toString();
  };

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs', period, filterUser, filterProduct, filterAction, dateFrom, dateTo],
    queryFn: () => apiServices.getAuditLogs(buildQueryParams()),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: apiServices.getUsers,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: apiServices.getProducts,
  });

  const logsList = Array.isArray(auditLogs?.results) ? auditLogs.results : (Array.isArray(auditLogs) ? auditLogs : []);
  const usersList = Array.isArray(users?.results) ? users.results : (Array.isArray(users) ? users : []);
  const productsList = Array.isArray(products?.results) ? products.results : (Array.isArray(products) ? products : []);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'STOCK_IN': 'Carico',
      'STOCK_OUT': 'Scarico',
      'BLACKLISTED': 'Blacklist',
      'RESTORED': 'Ripristinato',
      'QUARANTINED': 'Quarantena',
      'ORDER_CREATED': 'Ordine Creato',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'STOCK_IN': 'bg-green-100 text-green-700 border-green-200',
      'STOCK_OUT': 'bg-red-100 text-red-700 border-red-200',
      'BLACKLISTED': 'bg-black text-white border-black',
      'RESTORED': 'bg-green-800 text-white border-green-800',
      'QUARANTINED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'ORDER_CREATED': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[action] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Registro di Sistema</h1>
          <p className="text-slate-500 font-medium mt-1">
            Storico completo delle operazioni amministrative e di sicurezza
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-xl">
          <span className="text-indigo-700 font-black text-2xl">{logsList.length}</span>
          <span className="text-indigo-600 font-medium text-sm ml-2">azioni</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-primary" />
          <h2 className="text-xl font-black text-slate-800">Filtri</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <Calendar size={14} className="inline mr-1" /> Periodo
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="today">Oggi</option>
              <option value="week">Questa Settimana</option>
              <option value="month">Questo Mese</option>
              <option value="year">Quest'Anno</option>
              <option value="custom">Personalizzato</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Da</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">A</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <User size={14} className="inline mr-1" /> Utente
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Tutti</option>
              {usersList.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <Package size={14} className="inline mr-1" /> Prodotto
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Tutti</option>
              {productsList.map((product: any) => (
                <option key={product.id} value={product.id}>
                  [{product.sku}] {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              <FileText size={14} className="inline mr-1" /> Azione
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Tutte</option>
              <option value="STOCK_IN">Carico</option>
              <option value="STOCK_OUT">Scarico</option>
              <option value="BLACKLISTED">Blacklist</option>
              <option value="RESTORED">Ripristinato</option>
              <option value="QUARANTINED">Quarantena</option>
              <option value="ORDER_CREATED">Ordine Creato</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-8 rounded-3xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : logsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Nessuna azione trovata</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Data e Ora</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Utente</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Ruolo</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Azione</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Prodotto</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-600 uppercase tracking-wider">Quantità</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logsList.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">
                      {new Date(log.timestamp).toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-bold text-slate-800">{log.user_full_name}</div>
                      <div className="text-xs text-slate-500">{log.user_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase border",
                        getActionColor(log.action_type)
                      )}>
                        {getActionLabel(log.action_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-bold text-slate-800">{log.product_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{log.product_sku}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-black text-slate-800">
                      {log.quantity > 0 ? log.quantity : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

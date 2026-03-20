import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface InventoryLot {
  id: number;
  product: { id: number; name: string; sku: string };
  lot_number: string;
  quantity: number;
  unit_cost: string | number;
  total_value: number;
}

interface InventoryValuation {
  total_value: number;
  lots: InventoryLot[];
}

const fetchInventoryValue = async (): Promise<InventoryValuation> => {
  return await fetchApi('/reports/inventory_value/');
};

export default function InventoryValue() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory-value'],
    queryFn: fetchInventoryValue,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/dashboard" 
          className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 rounded-xl shadow-sm transition-all text-slate-700 hover:text-slate-900 font-medium"
        >
          <ArrowLeft size={18} />
          Torna alla Dashboard
        </Link>
      </div>

      <div className="glass-card p-8 min-h-[60vh] rounded-3xl bg-white/60 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_30px_rgb(16,185,129,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 border border-emerald-500/20">
              <DollarSign size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Valore Inventario</h1>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg border border-emerald-400 text-white min-w-[250px]">
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <TrendingUp size={16} /> Valore Totale
            </p>
            {isLoading ? (
              <div className="h-10 bg-white/20 animate-pulse rounded w-3/4"></div>
            ) : (
              <h2 className="text-4xl font-black tracking-tighter drop-shadow-md">
                € {data?.total_value?.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
              </h2>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">Dettaglio per Lotti / Movimenti</h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/40 animate-pulse rounded-2xl border border-white/50"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="font-semibold text-lg">Errore nel caricamento del valore di inventario</p>
          </div>
        ) : !data?.lots || data.lots.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Inventario vuoto o nessun valore registrato.</p>
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-emerald-200/50 overflow-hidden shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-white/60 text-emerald-800 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Lotto</th>
                  <th className="p-4 font-bold">Prodotto</th>
                  <th className="p-4 font-bold text-center">Q.tà</th>
                  <th className="p-4 font-bold text-right">Costo Unitario</th>
                  <th className="p-4 font-bold text-right">Valore Totale</th>
                </tr>
              </thead>
              <tbody>
                {data.lots.map((lot) => (
                  <tr key={lot.id} className="border-b border-emerald-50/50 last:border-0 hover:bg-white/60 transition-colors">
                    <td className="p-4 font-mono text-sm font-semibold text-slate-600">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">{lot.lot_number}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{lot.product.name}</div>
                      <div className="font-mono text-xs text-slate-500">{lot.product.sku}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-700 text-center">{lot.quantity}</td>
                    <td className="p-4 text-slate-600 font-medium text-right">
                      € {Number(lot.unit_cost).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-emerald-600 font-black text-right">
                      € {Number(lot.total_value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

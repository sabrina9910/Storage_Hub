import { DollarSign, Package, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIData {
  inventoryValue: number;
  activeProducts: number;
  lowStockAlerts: number;
  quarantineItems: number;
}

export default function KPIGrid({ data }: { data: KPIData }) {
  const kpis = [
    {
      title: "Valore Inventario",
      value: `€${data.inventoryValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradId: "grad-emerald",
      bgClass: "from-emerald-500/10 to-emerald-500/5",
      borderClass: "border-emerald-500/20"
    },
    {
      title: "Prodotti Attivi",
      value: data.activeProducts.toString(),
      icon: Package,
      gradId: "grad-blue",
      bgClass: "from-blue-500/10 to-blue-500/5",
      borderClass: "border-blue-500/20"
    },
    {
      title: "Allarmi Scorte",
      value: data.lowStockAlerts.toString(),
      icon: AlertTriangle,
      gradId: "grad-amber",
      bgClass: "from-amber-500/10 to-amber-500/5",
      borderClass: "border-amber-500/20"
    },
    {
      title: "Articoli in Quarantena",
      value: data.quarantineItems.toString(),
      icon: ShieldAlert,
      gradId: "grad-rose",
      bgClass: "from-rose-500/10 to-rose-500/5",
      borderClass: "border-rose-500/20"
    }
  ];

  return (
    <>
      {/* SVG Defs for SVG Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
    
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div 
            key={index} 
            className={cn(
              "glass-card p-6 flex items-start justify-between border-t-4 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300",
              kpi.borderClass
            )}
          >
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", `bg-${kpi.gradId.replace('grad-', '')}-500`)}></span>
                {kpi.title}
              </p>
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
                {kpi.value}
              </h3>
            </div>
            <div className={cn("p-4 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner border border-white/50", kpi.bgClass)}>
              <Icon size={32} strokeWidth={2} color={`url(#${kpi.gradId})`} />
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  IN: number;
  OUT: number;
}

export default function ActivityChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="glass-card p-6 h-full min-h-[400px] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Volume Movimenti</h3>
          <p className="text-sm font-medium text-slate-500">Entrate vs Uscite negli ultimi 7 giorni</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-600">IN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-sm font-bold text-slate-600">OUT</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <filter id="neonGlowBase" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="colorIN" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOUT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.4)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderTop: '1px solid rgba(255, 255, 255, 0.9)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.3)'
              }}
              itemStyle={{ fontWeight: '900', color: '#1e293b' }}
              labelStyle={{ color: '#475569', marginBottom: '6px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}
            />
            <Area 
              type="monotone" 
              dataKey="IN" 
              stroke="#10b981" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorIN)" 
              activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981', style: { filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' } }}
              style={{ filter: 'url(#neonGlowBase)' }}
            />
            <Area 
              type="monotone" 
              dataKey="OUT" 
              stroke="#f43f5e" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorOUT)" 
              activeDot={{ r: 8, strokeWidth: 0, fill: '#f43f5e', style: { filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.8))' } }}
              style={{ filter: 'url(#neonGlowBase)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

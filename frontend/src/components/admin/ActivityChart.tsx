import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  IN: number;
  OUT: number;
}

export default function ActivityChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="glass-card p-6 h-full min-h-[400px] flex flex-col rounded-3xl overflow-hidden relative border border-white/60 shadow-sm bg-white/40">
      <div className="mb-6 flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Volume Movimenti</h3>
          <p className="text-sm font-medium text-slate-500">Entrate vs Uscite negli ultimi 7 giorni</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="text-sm font-bold text-slate-600">IN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-sm font-bold text-slate-600">OUT</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full mt-4 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIN" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOUT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(148, 163, 184, 0.15)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
              }}
              itemStyle={{ fontWeight: '700', color: '#334155' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="IN" 
              stroke="#94a3b8" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIN)" 
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: '#94a3b8' }}
            />
            <Area 
              type="monotone" 
              dataKey="OUT" 
              stroke="#cbd5e1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorOUT)" 
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: '#cbd5e1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

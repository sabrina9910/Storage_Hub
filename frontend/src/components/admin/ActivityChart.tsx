import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  IN: number;
  OUT: number;
}

export default function ActivityChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="glass-card p-6 h-full min-h-[400px] flex flex-col rounded-3xl overflow-hidden relative border border-white/60 shadow-sm bg-white/40">
      <div className="mb-8 flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Volume Movimenti</h3>
          <p className="text-sm font-semibold text-slate-400">Trend entrate e uscite degli ultimi 7 giorni</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">IN</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"></span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">OUT</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorIN" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOUT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
              dy={15}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              width={40}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(148, 163, 184, 0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 1)',
                boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ fontWeight: '800', fontSize: '13px' }}
              labelStyle={{ color: '#64748b', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="IN" 
              stroke="#10b981" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorIN)" 
              activeDot={{ r: 7, strokeWidth: 3, stroke: '#ffffff', fill: '#10b981' }}
            />
            <Area 
              type="monotone" 
              dataKey="OUT" 
              stroke="#f59e0b" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorOUT)" 
              activeDot={{ r: 7, strokeWidth: 3, stroke: '#ffffff', fill: '#f59e0b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

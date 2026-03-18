export default function HomeWorker() {
  return (
    <div className="space-y-6 pb-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Ready to manage inventory</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold border border-slate-100">
          W
        </div>
      </header>
      
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg text-slate-800">Quick Actions</h2>
        <p className="text-slate-500 text-sm mt-2">Warehouse worker dashboard placeholder.</p>
      </div>
    </div>
  );
}

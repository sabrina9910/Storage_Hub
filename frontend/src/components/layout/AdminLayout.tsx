import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Package, ArrowLeftRight, Users, LogOut, Search, Menu, X, Terminal, Tags, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiServices } from '@/lib/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: currentUser } = useQuery({ queryKey:['currentUser'], queryFn: apiServices.getCurrentUser });

  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim() !== '') {
      const q = globalSearch.trim();
      try {
        const history = JSON.parse(localStorage.getItem('storagehub_search_history') || '[]');
        const newHistory = [q, ...history.filter((h: string) => h !== q)].slice(0, 10);
        localStorage.setItem('storagehub_search_history', JSON.stringify(newHistory));
      } catch (err) {}
      
      navigate(`/admin/search?q=${encodeURIComponent(q)}`);
      setGlobalSearch('');
    }
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    apiServices.logout();
    navigate('/login');
  };

  const navItems = [];
  
  // Base items for everyone who is at least a worker
  if (currentUser?.is_warehouse_worker || currentUser?.is_admin || currentUser?.is_superuser) {
    if (currentUser?.is_warehouse_worker && !currentUser?.is_admin && !currentUser?.is_superuser) {
        navItems.push(
            { name: 'My Workspace', to: '/worker/dashboard', icon: LayoutDashboard },
            { name: 'Wizard Movimenti', to: '/worker/movement', icon: ArrowLeftRight }
        );
    } else {
        navItems.push(
            { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }
        );
    }

    // Shared inventory management items
    navItems.push(
      { name: 'Catalogo', to: '/admin/products', icon: Package },
      { name: 'Categorie', to: '/admin/categories', icon: Tags },
      { name: 'Registro Mov.', to: '/admin/inventory', icon: ArrowLeftRight },
      { name: 'Fornitori', to: '/admin/suppliers', icon: Users }
    );
  }

  // God Mode specific items
  if (currentUser?.is_superuser) {
    navItems.push(
      { name: 'System Logs', to: '/admin/system', icon: Terminal }
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Left Sidebar */}
      <aside className={cn(
        "w-64 fixed inset-y-4 left-4 z-50 glass-card flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 overflow-hidden",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-[150%]"
      )}>
        <div className="p-6 border-b border-glass-border/50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">Storage<span className="text-slate-800">Hub</span></h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 group",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-600 hover:bg-white/60 hover:text-primary"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={20} 
                      className={cn(
                        "transition-transform duration-300", 
                        !isActive && "group-hover:scale-110"
                      )} 
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-error/10 hover:text-error transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[18rem] flex flex-col min-h-screen transition-all duration-300 w-full text-sm md:text-base">
        {/* Top Header */}
        <header className="h-16 md:h-24 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 bg-transparent">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative w-full md:w-96 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
                placeholder="Cerca prodotto (Premi Invio)..." 
                className="w-full pl-12 pr-4 py-2.5 rounded-full border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white/60 shadow-inner transition-all text-sm font-medium"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/profile"
              className="group flex items-center gap-4 hover:bg-slate-50 p-2 pr-4 rounded-full transition-colors border border-transparent hover:border-slate-100"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                  {currentUser?.email ? currentUser.email.split('@')[0] : 'Utente'}
                </p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                  {currentUser?.is_superuser ? 'Superuser' : currentUser?.is_warehouse_worker ? 'Worker' : 'Admin'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border-2 border-white shadow-md uppercase group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all relative">
                {currentUser?.email ? currentUser.email.charAt(0) : 'U'}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-slate-400 group-hover:text-primary">
                  <UserCircle size={14} />
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

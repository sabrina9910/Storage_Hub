import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Login from './pages/Login';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import ProductCatalog from './pages/admin/ProductCatalog';
import CategoryManager from './pages/admin/CategoryManager';
import SupplierManager from './pages/admin/SupplierManager';
import SupplierDetail from './pages/admin/SupplierDetail';
import MovementLogs from './pages/admin/MovementLogs';
import UserProfile from './pages/admin/UserProfile';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import DesktopMovementWizard from './pages/worker/DesktopMovementWizard';
import UsersManagement from './pages/admin/UsersManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// New KPI Drill-down Pages
import ActiveProductsList from './pages/admin/ActiveProductsList';
import QuarantineList from './pages/admin/QuarantineList';
import LowStockAlerts from './pages/admin/LowStockAlerts';
import InventoryValue from './pages/admin/InventoryValue';
import AtRiskLots from './pages/admin/AtRiskLots';
import ProductDetail from './pages/admin/ProductDetail';
import GlobalSearch from './pages/admin/GlobalSearch';
import Profile from './pages/admin/Profile';
import SystemLogs from './pages/admin/SystemLogs';
import Movimenti from './pages/admin/Movimenti';
import Blacklist from './pages/admin/Blacklist';
import AuditLog from './pages/admin/AuditLog';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Main Unified Container */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/magazziniere" element={<Navigate to="/magazziniere/dashboard" replace />} />
              
              {/* Unified Inventory Routes (Admin + Worker) */}
              <Route element={<ProtectedRoute requiredRole="magazziniere" />}>
                <Route path="/admin/products" element={<ProductCatalog />} />
                <Route path="/admin/categories" element={<CategoryManager />} />
                <Route path="/admin/suppliers" element={<SupplierManager />} />
                <Route path="/admin/suppliers/:id" element={<SupplierDetail />} />
                <Route path="/admin/inventory" element={<MovementLogs />} />
                <Route path="/admin/movimenti" element={<Movimenti />} />
                <Route path="/admin/profile" element={<UserProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/search" element={<GlobalSearch />} />
                
                {/* Keep old worker routes functional for backward compatibility if needed, or redirect them */}
                <Route path="/magazziniere/dashboard" element={<WorkerDashboard />} />
                <Route path="/magazziniere/movement" element={<DesktopMovementWizard />} />
              </Route>

              {/* Strict Admin Routes */}
              <Route element={<ProtectedRoute requiredRole="amministratore" />}>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/active-products" element={<ActiveProductsList />} />
                <Route path="/admin/quarantine" element={<QuarantineList />} />
                <Route path="/admin/blacklist" element={<Blacklist />} />
                <Route path="/admin/audit-log" element={<AuditLog />} />
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/low-stock-alerts" element={<LowStockAlerts />} />
                <Route path="/admin/inventory-value" element={<InventoryValue />} />
                <Route path="/admin/at-risk-lots" element={<AtRiskLots />} />
                <Route path="/admin/products/:id" element={<ProductDetail />} />
              </Route>
              
              {/* God Mode Route */}
              <Route element={<ProtectedRoute requiredRole="superuser" />}>
                <Route path="/admin/system" element={<SystemLogs />} />
              </Route>
            </Route>
          </Route>
        </Routes>
        
        {/* Global Toaster for API Feedback */}
        <Toaster 
          position="top-center"
          toastOptions={{
            className: 'glass text-dark-text font-medium',
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#0f172a',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

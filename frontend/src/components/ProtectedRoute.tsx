import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  requiredRole?: 'amministratore' | 'magazziniere' | 'superuser';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: apiServices.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/20 rounded-xl mb-4"></div>
          <div className="text-slate-500 font-medium">Verifying Session...</div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'amministratore' && user.role !== 'amministratore' && !user.is_superuser) {
    toast.error('Accesso Negato: Richiesto livello Amministratore.');
    return <Navigate to="/magazziniere/dashboard" replace />;
  }

  if (requiredRole === 'magazziniere' && user.role !== 'magazziniere' && user.role !== 'amministratore' && !user.is_superuser) {
    toast.error('Accesso Negato: Richiesto livello Operatore.');
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (requiredRole === 'superuser' && !user.is_superuser) {
    toast.error('Accesso Negato: Richiesto livello di Sistema (God Mode).');
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Inject user context via Outlet context if needed
  return <Outlet context={{ user }} />;
}

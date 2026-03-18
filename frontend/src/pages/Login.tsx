import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { apiServices } from '../lib/api';
import { Loader2 } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await apiServices.login(data);

      const user = await apiServices.getCurrentUser();

      toast.success('Accesso effettuato');

      if (user.is_superuser || user.is_admin) {
        navigate('/admin/dashboard');
      } else if (user.is_warehouse_worker) {
        navigate('/worker/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error('Credenziali non valide o errore del server');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login: fills the form visually AND submits immediately without timing issues
  const handleQuickLogin = async (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    // Call onSubmit directly to avoid React Hook Form async setValue timing issues
    await onSubmit({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/30">
          S
        </div>
        <div>
          <h1 className="text-3xl font-bold text-dark-text tracking-tight mt-4">StorageHub</h1>
          <p className="text-slate-500 mt-2">Accedi al tuo account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: "L'email è obbligatoria" })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="admin@example.com"
            />
            {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'La password è obbligatoria' })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-xs text-error mt-1">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-primary/30 mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accedi'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accesso Rapido (Ambiente di Test)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('test@test.com', 'test1234')}
              className="text-xs font-medium py-2 px-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors border border-purple-200 shadow-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Superuser'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('manager@test.com', 'managerpassword')}
              className="text-xs font-medium py-2 px-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200 shadow-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Manager'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('worker@test.com', 'workerpassword')}
              className="text-xs font-medium py-2 px-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200 shadow-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Worker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

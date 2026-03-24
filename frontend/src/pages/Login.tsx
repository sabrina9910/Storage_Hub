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
      const res = await apiServices.login(data);
      localStorage.setItem('access_token', res.access);
      if (res.refresh) {
        localStorage.setItem('refresh_token', res.refresh);
      }
      const user = await apiServices.getCurrentUser();

      toast.success('Accesso effettuato');

      if (user.role === 'amministratore' || user.is_superuser) {
        navigate('/admin/dashboard');
      } else if (user.role === 'magazziniere') {
        navigate('/magazziniere/dashboard');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient orbs for premium glassmorphism background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full blur-3xl mix-blend-multiply pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-sky-300/30 rounded-full blur-3xl mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[20rem] h-[20rem] bg-purple-300/20 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-10 text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-3xl mx-auto flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-primary/40 border border-white/20 transform hover:scale-105 transition-transform duration-300">
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
              className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/70 outline-none transition-all duration-300 focus:shadow-inner text-slate-800 placeholder-slate-400 font-medium"
              placeholder="admin@example.com"
            />
            {errors.email && <span className="text-xs text-error mt-1.5 font-medium flex items-center gap-1">⚠ {errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'La password è obbligatoria' })}
              className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/70 outline-none transition-all duration-300 focus:shadow-inner text-slate-800 placeholder-slate-400 font-medium"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-xs text-error mt-1.5 font-medium flex items-center gap-1">⚠ {errors.password.message}</span>}
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
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('admin@storagehub.com', 'admin123')}
              className="text-xs font-bold py-2.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200 shadow-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Admin'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('magazziniere@storagehub.com', 'magazzino123')}
              className="text-xs font-bold py-2.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200 shadow-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Magazziniere'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

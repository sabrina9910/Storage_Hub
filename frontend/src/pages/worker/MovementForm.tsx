import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Undo2 } from 'lucide-react';
import { apiServices } from '@/lib/api';
import { cn } from '@/lib/utils';
import Keypad from '@/components/Keypad';

type MovementType = 'IN' | 'OUT' | 'RETURN' | 'QUARANTINE';

const MOVEMENT_OPTIONS = [
  { id: 'IN', label: 'Receipt (IN)', icon: ArrowDownToLine, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
  { id: 'OUT', label: 'Dispatch (OUT)', icon: ArrowUpFromLine, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { id: 'RETURN', label: 'Return', icon: Undo2, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
  { id: 'QUARANTINE', label: 'Quarantine', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
];

export default function MovementForm() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [movementType, setMovementType] = useState<MovementType>('OUT');
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [errorText, setErrorText] = useState('');

  // Fetch Lots (we should ideally fetch lots matching a scanned product, but here we list all lots)
  const { data: lots, isLoading } = useQuery({
    queryKey: ['lots'],
    queryFn: apiServices.getLots,
  });

  const mutation = useMutation({
    mutationFn: apiServices.createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      // Reset form on success
      setStep(1);
      setSelectedLot(null);
      setQuantity('');
      setErrorText('');
      alert('Movement registered successfully!');
    },
    onError: (error: any) => {
      setErrorText(error.message || 'Failed to register movement');
    }
  });

  const handleSubmit = () => {
    if (!selectedLot || !quantity) return;
    mutation.mutate({
      lot: selectedLot,
      movement_type: movementType,
      quantity: parseInt(quantity, 10),
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Stock Movement</h1>
        <p className="text-slate-500 text-sm mt-1">Register IN/OUT/RETURN flow</p>
      </header>

      {/* STEP 1: Select Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-700">1. Select Movement Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {MOVEMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setMovementType(opt.id as MovementType);
                    setStep(2);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 glass-card",
                    opt.bg
                  )}
                >
                  <Icon className={opt.color} size={32} />
                  <span className="font-semibold text-sm">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Select Lot */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">2. Select Product Lot</h2>
            <button onClick={() => setStep(1)} className="text-primary text-sm font-medium">Back</button>
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-slate-500 py-10">Loading lots...</p>
            ) : lots?.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No active lots found.</p>
            ) : (
              lots?.map((lot: any) => (
                <button
                  key={lot.id}
                  onClick={() => {
                    setSelectedLot(lot.id);
                    setStep(3);
                  }}
                  className="w-full text-left p-4 rounded-xl glass border border-glass-border hover:border-primary/50 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark-text truncate">{lot.product_detail?.name || 'Unknown Product'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                        Lot: {lot.lot_number}
                      </span>
                      <span className="text-xs text-slate-500">Exp: {lot.expiration_date}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">Stock</p>
                    <p className="font-bold text-lg">{lot.current_quantity}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Quantity Keypad */}
      {step === 3 && (
        <div className="space-y-4 animate-in zoom-in-95 fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-700">3. Enter Quantity</h2>
            <button onClick={() => { setStep(2); setQuantity(''); setErrorText(''); }} className="text-primary text-sm font-medium">Back</button>
          </div>
          
          <div className="p-4 rounded-xl glass border-l-4 border-l-primary mb-6">
            <p className="text-sm font-semibold text-primary">Recording {movementType}</p>
            <p className="text-xs text-slate-600 mt-1">For lot selected previously.</p>
          </div>

          <Keypad 
            value={quantity} 
            onChange={setQuantity} 
            onSubmit={handleSubmit}
            submitLabel={mutation.isPending ? "Connecting..." : "Confirm Movement"}
          />

          {errorText && (
            <div className="p-3 mt-4 bg-error/10 text-error text-sm rounded-lg border border-error/20 text-center font-medium animate-in slide-in-from-bottom-2 fade-in">
              {errorText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';
import { apiServices } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([
    {
      id: '1',
      text: 'Ciao! Sono il tuo assistente StorageHub. Come posso aiutarti oggi?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await apiServices.askChatbot({ message: userMsg.text });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Scusa, si è verificato un errore nella connessione con il server AI.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] glass-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-primary text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <span className="font-bold tracking-tight">StorageHub AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
            {history.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[85%] animate-in fade-in duration-300",
                  msg.sender === 'user' ? "items-end ml-auto" : "items-start"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  msg.sender === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <span className="text-xs font-medium">L'AI sta scrivendo...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Fai una domanda..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
          isOpen ? "bg-slate-800 text-white rotate-90" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-white"></span>
            </span>
        )}
      </button>
    </div>
  );
}

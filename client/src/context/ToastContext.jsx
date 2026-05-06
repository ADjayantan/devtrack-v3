import { createContext, useContext, useState, useCallback, useId } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-400">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-cyan-400">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
    </svg>
  ),
};

const BORDER_COLORS = {
  success: 'border-emerald-800/60',
  error: 'border-red-800/60',
  info: 'border-cyan-800/60',
};

const ToastItem = ({ toast, onDismiss }) => (
  <div
    className={`flex items-start gap-3 bg-navy-800 border ${BORDER_COLORS[toast.type]} 
                rounded-xl px-4 py-3 shadow-xl min-w-[260px] max-w-sm animate-slide-up`}
  >
    <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
    <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
    <button
      onClick={() => onDismiss(toast.id)}
      className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // max 5 toasts
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur || 5000),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-900',
    icon: AlertCircle,
    iconClass: 'text-red-600',
  },
  info: {
    container: 'border-blue-200 bg-blue-50 text-blue-900',
    icon: Info,
    iconClass: 'text-blue-600',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Global Top-Right Toast Container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          const IconComponent = style.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg transition-all duration-200 ${style.container}`}
            >
              <IconComponent className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded p-0.5 opacity-60 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;

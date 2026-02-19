import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { XMarkIcon } from '../components/icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  text: string;
  onClick: () => void;
}

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, ...toast }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000); // Auto-dismiss after 5 seconds
  }, [removeToast]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-container ${toast.type}`}>
            <div
              className={`flex flex-col w-full p-4 rounded-lg shadow-lg text-white ${
                toast.type === 'success' ? 'bg-green-500' : 
                toast.type === 'error' ? 'bg-red-500' : 'bg-sky-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <p className="text-sm font-medium">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)} 
                  className="ml-4 p-1 rounded-full hover:bg-white/20"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {toast.action && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="px-3 py-1 text-xs font-medium bg-white/20 rounded hover:bg-white/30 transition-colors"
                  >
                    {toast.action.text}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
       <style>{`
        .toast-container {
          animation: toast-in-right 0.5s ease;
        }
        @keyframes toast-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

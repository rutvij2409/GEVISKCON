import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icon } from '../components/Icon';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

type AddToastFunction = (toast: Omit<ToastMessage, 'id'>) => void;

const ToastContext = createContext<AddToastFunction | null>(null);

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800";

  let icon;
  switch (toast.type) {
    case 'success':
      icon = <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-6 h-6 text-green-500" />;
      break;
    case 'error':
      icon = <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-6 h-6 text-red-500" />;
      break;
    case 'info':
      icon = <Icon path="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" className="w-6 h-6 text-blue-500" />;
      break;
  }

  return (
    <div className={baseClasses} role="alert">
      <div className="flex-shrink-0">{icon}</div>
      <div className="pl-4 text-sm font-normal">{toast.message}</div>
      <button onClick={() => onDismiss(toast.id)} className="pl-4">
        <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): AddToastFunction => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

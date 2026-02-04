import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextData {
    addToast: (message: string, type: ToastType) => void;
}

// Context
const ToastContext = createContext<ToastContextData>({} as ToastContextData);

// Hook
export const useToast = () => useContext(ToastContext);

// Provider Component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);

        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3s
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="toast-slide-in flex items-center gap-3 min-w-[300px] p-4 rounded-xl bg-[#1A1A1A] border border-white/10 shadow-2xl backdrop-blur-xl"
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className={`size-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' :
                                toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                        <p className="text-sm font-medium text-gray-200">{toast.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

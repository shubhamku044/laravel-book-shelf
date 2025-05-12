import React, { useState, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'default';
    duration?: number;
    onClose?: () => void;
}

const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all transform duration-300 ease-in-out',
    {
        variants: {
            variant: {
                default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
                success: 'bg-white dark:bg-gray-900 border-l-4 border-green-500 text-gray-900 dark:text-gray-100',
                error: 'bg-white dark:bg-gray-900 border-l-4 border-red-500 text-gray-900 dark:text-gray-100',
                warning: 'bg-white dark:bg-gray-900 border-l-4 border-yellow-500 text-gray-900 dark:text-gray-100',
                info: 'bg-white dark:bg-gray-900 border-l-4 border-blue-500 text-gray-900 dark:text-gray-100',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export function Toast({ 
    message, 
    type = 'default', 
    duration = 3000, 
    onClose 
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const baseClasses = "fixed bottom-4 right-4 z-50 max-w-md transition-all transform duration-500";
    
    const visibilityClasses = isVisible 
        ? "translate-y-0 opacity-100 scale-100" 
        : "translate-y-[20px] opacity-0 scale-95 pointer-events-none";

    return (
        <div className={`${baseClasses} ${visibilityClasses}`}>
            <div className={toastVariants({ variant: type })}>
                <div className="flex items-center gap-2">
                    {type === 'success' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    {type === 'error' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    {type === 'warning' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                    {type === 'info' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    )}
                    <div className="flex-1">{message}</div>
                </div>
                
                <button 
                    onClick={() => {
                        setIsVisible(false);
                        if (onClose) onClose();
                    }}
                    className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastProps['type'] }>>([]);

    const showToast = (message: string, type: ToastProps['type'] = 'default') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto-remove after 5 seconds (increased from 3 seconds for better readability)
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
        
        return id;
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const ToastContainer = () => (
        <div className="toast-container fixed bottom-0 right-0 z-[100] flex flex-col-reverse gap-3 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse md:max-w-[420px]">
            {toasts.map((toast, index) => (
                <div 
                    key={toast.id} 
                    className="transform transition-all duration-500 ease-in-out" 
                    style={{ 
                        opacity: 1,
                        transform: `translateY(${index * -5}px)`,
                        animationDelay: `${index * 100}ms`
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );

    return { showToast, removeToast, ToastContainer };
}

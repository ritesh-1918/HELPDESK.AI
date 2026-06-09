import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function Button({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md',
    ...props 
}) {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
        secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none hover:text-gray-900 focus:ring-gray-200",
        outline: "bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 shadow-none"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button 
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} 
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;

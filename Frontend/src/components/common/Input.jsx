import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export const Input = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={twMerge(clsx(
                "w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all outline-none font-medium text-gray-900 placeholder-gray-400",
                error 
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30" 
                    : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white",
                className
            ))}
            {...props}
        />
    );
});

Input.displayName = 'Input';
export default Input;

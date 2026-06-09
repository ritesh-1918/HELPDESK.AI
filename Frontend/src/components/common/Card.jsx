import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function Card({ children, className, ...props }) {
    return (
        <div 
            className={twMerge(clsx("bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden", className))}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }) {
    return (
        <div className={twMerge(clsx("px-6 py-5 border-b border-gray-50", className))} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className, ...props }) {
    return (
        <h3 className={twMerge(clsx("text-lg font-bold text-gray-900 tracking-tight", className))} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className, ...props }) {
    return (
        <div className={twMerge(clsx("p-6", className))} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className, ...props }) {
    return (
        <div className={twMerge(clsx("px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center", className))} {...props}>
            {children}
        </div>
    );
}

export default Card;

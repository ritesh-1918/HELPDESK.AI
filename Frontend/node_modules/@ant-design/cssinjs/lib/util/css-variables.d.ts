import type { HashPriority } from '../StyleContext';
export declare const token2CSSVar: (token: string, prefix?: string) => string;
export declare const serializeCSSVar: <T extends Record<string, any>>(cssVars: T, hashId: string, options?: {
    scope?: string | string[];
    hashCls?: string;
    hashPriority?: HashPriority;
}) => string;
export type TokenWithCSSVar<V, T extends Record<string, V> = Record<string, V>> = {
    [key in keyof T]?: string | V;
};
export declare const transformToken: <V, T extends Record<string, V> = Record<string, V>>(token: T, themeKey: string, config?: {
    prefix?: string | undefined;
    ignore?: { [key in keyof T]?: boolean | undefined; } | undefined;
    unitless?: { [key_1 in keyof T]?: boolean | undefined; } | undefined;
    preserve?: { [key_2 in keyof T]?: boolean | undefined; } | undefined;
    scope?: string | string[] | undefined;
    hashCls?: string | undefined;
    hashPriority?: HashPriority | undefined;
} | undefined) => [TokenWithCSSVar<V, T>, string];

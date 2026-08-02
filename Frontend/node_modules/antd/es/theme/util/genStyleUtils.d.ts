import type { AliasToken, ComponentTokenMap } from '../interface';
export declare const genStyleHooks: <C extends keyof ComponentTokenMap>(component: C | [C, string], styleFn: import("@ant-design/cssinjs-utils").GenStyleFn<ComponentTokenMap, AliasToken, C>, getDefaultToken?: import("@ant-design/cssinjs-utils").GetDefaultToken<ComponentTokenMap, AliasToken, C> | undefined, options?: {
    resetStyle?: boolean;
    resetFont?: boolean;
    deprecatedTokens?: [keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C], undefined>, keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C], undefined>][] | undefined;
    unitless?: Partial<Record<keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C], undefined>, boolean>> | undefined;
    clientOnly?: boolean;
    order?: number;
    injectStyle?: boolean;
    extraCssVarPrefixCls?: string[] | ((info: {
        prefixCls: string;
        rootCls: string;
    }) => string[]);
} | undefined) => (prefixCls: string, rootCls?: string) => readonly [string, string], genComponentStyleHook: <C_1 extends keyof ComponentTokenMap>(componentName: C_1 | [C_1, string], styleFn: import("@ant-design/cssinjs-utils").GenStyleFn<ComponentTokenMap, AliasToken, C_1>, getDefaultToken?: import("@ant-design/cssinjs-utils").GetDefaultToken<ComponentTokenMap, AliasToken, C_1> | undefined, options?: {
    resetStyle?: boolean;
    resetFont?: boolean;
    deprecatedTokens?: [keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C_1], undefined>, keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C_1], undefined>][] | undefined;
    clientOnly?: boolean;
    order?: number;
    injectStyle?: boolean;
    unitless?: Partial<Record<keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C_1], undefined>, boolean>> | undefined;
} | undefined) => (prefixCls: string, rootCls?: string) => string, genSubStyleComponent: <C extends keyof ComponentTokenMap>(componentName: C | [C, string], styleFn: import("@ant-design/cssinjs-utils").GenStyleFn<ComponentTokenMap, AliasToken, C>, getDefaultToken?: import("@ant-design/cssinjs-utils").GetDefaultToken<ComponentTokenMap, AliasToken, C> | undefined, options?: {
    resetStyle?: boolean;
    resetFont?: boolean;
    deprecatedTokens?: [keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C], undefined>, keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C], undefined>][] | undefined;
    clientOnly?: boolean;
    order?: number;
    injectStyle?: boolean;
    unitless?: Partial<Record<keyof Exclude<import("@ant-design/cssinjs-utils").OverrideTokenMap<ComponentTokenMap, AliasToken>[C], undefined>, boolean>> | undefined;
} | undefined) => React.FunctionComponent<import("@ant-design/cssinjs-utils/lib/util/genStyleUtils").SubStyleComponentProps>;
type CssVarName = (name: string) => `--${string}`;
type CssVarRef = (name: string, fallback?: string | number) => `var(--${string})`;
export declare const genCssVar: (antCls: string, component: string) => readonly [varName: CssVarName, varRef: CssVarRef];
export {};

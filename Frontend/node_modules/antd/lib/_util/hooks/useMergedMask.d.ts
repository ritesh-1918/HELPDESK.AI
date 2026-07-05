export interface MaskConfig {
    enabled?: boolean;
    blur?: boolean;
    closable?: boolean;
}
export type MaskType = MaskConfig | boolean;
export declare const normalizeMaskConfig: (mask?: MaskType, maskClosable?: boolean) => MaskConfig;
export declare const useMergedMask: (mask?: MaskType, contextMask?: MaskType, prefixCls?: string, maskClosable?: boolean) => [config: boolean, maskBlurClassName: {
    [key: string]: string | undefined;
}, maskClosable: boolean];

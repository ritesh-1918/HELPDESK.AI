import type { ValidateStatus } from '../form/FormItem';
declare const _InputStatuses: readonly ["warning", "error", "", "success", "validating"];
export type InputStatus = (typeof _InputStatuses)[number];
export declare const getStatusClassNames: (prefixCls: string, status?: ValidateStatus, hasFeedback?: boolean) => string;
export declare const getMergedStatus: (contextStatus?: ValidateStatus, customStatus?: InputStatus) => "" | "success" | "error" | "warning" | "validating" | undefined;
export {};

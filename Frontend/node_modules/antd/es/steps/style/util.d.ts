import type { CSSObject } from '@ant-design/cssinjs';
import type { StepsToken } from '.';
/**
 * Force override the width related styles.
 * This should be multiple since will conflict with other `rail` styles.
 */
export declare const getItemWithWidthStyle: (token: StepsToken, marginSize: number, optionalStyle?: CSSObject) => CSSObject;

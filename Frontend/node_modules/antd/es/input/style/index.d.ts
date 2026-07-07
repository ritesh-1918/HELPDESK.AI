import type { CSSObject } from '@ant-design/cssinjs';
import type { GenerateStyle } from '../../theme/internal';
import type { ComponentToken, InputToken } from './token';
import { initComponentToken, initInputToken } from './token';
export type { ComponentToken };
export { initComponentToken, initInputToken };
export declare const genPlaceholderStyle: (color: string) => CSSObject;
export declare const genActiveStyle: (token: InputToken) => {
    borderColor: string;
    boxShadow: string;
    outline: number;
    backgroundColor: string;
};
export declare const genInputLargeStyle: (token: InputToken) => CSSObject;
export declare const genInputSmallStyle: (token: InputToken) => CSSObject;
export declare const genBasicInputStyle: (token: InputToken, option?: {
    largeStyle?: CSSObject;
    smallStyle?: CSSObject;
}) => CSSObject;
export declare const genInputGroupStyle: (token: InputToken) => CSSObject;
export declare const genInputStyle: GenerateStyle<InputToken>;
export declare const genAffixStyle: GenerateStyle<InputToken>;
export declare const useSharedStyle: (prefixCls: string, rootCls?: string) => readonly [string, string];
declare const _default: (prefixCls: string, rootCls?: string) => readonly [string, string];
export default _default;

import type React from 'react';
import type { FullToken, GenStyleFn, GetDefaultToken } from '../../theme/internal';
export interface ComponentToken {
    /**
     * @desc 默认背景色
     * @descEN Default background color
     */
    defaultBg: string;
    /**
     * @desc 默认文字颜色
     * @descEN Default text color
     */
    defaultColor: string;
    /**
     * @desc 默认实心标签的文本色
     * @descEN Default text color for solid tag.
     */
    solidTextColor: string;
}
export interface TagToken extends FullToken<'Tag'> {
    tagFontSize: number;
    tagLineHeight: React.CSSProperties['lineHeight'];
    tagIconSize: number | string;
    tagPaddingHorizontal: number;
    tagBorderlessBg: string;
}
export declare const prepareToken: (token: Parameters<GenStyleFn<'Tag'>>[0]) => TagToken;
export declare const prepareComponentToken: GetDefaultToken<'Tag'>;
declare const _default: (prefixCls: string, rootCls?: string) => readonly [string, string];
export default _default;

import type { FullToken, GetDefaultToken } from '../../theme/internal';
/** Component only token. Which will handle additional calculation of alias token */
export type ComponentToken = object;
/**
 * @desc FloatButton 组件的 Token
 * @descEN Token for FloatButton component
 */
export type FloatButtonToken = FullToken<'FloatButton'> & {
    /**
     * @desc FloatButton 尺寸
     * @descEN Size of FloatButton
     */
    floatButtonSize: number;
    /**
     * @desc FloatButton 图标尺寸
     * @descEN Icon size of FloatButton
     */
    floatButtonIconSize: number | string;
    /**
     * @desc FloatButton 底部内边距
     * @descEN Bottom inset of FloatButton
     */
    floatButtonInsetBlockEnd: number;
    /**
     * @desc FloatButton 右侧内边距
     * @descEN Right inset of FloatButton
     */
    floatButtonInsetInlineEnd: number;
};
export declare const prepareComponentToken: GetDefaultToken<'FloatButton'>;
declare const _default: (prefixCls: string, rootCls?: string) => readonly [string, string];
export default _default;

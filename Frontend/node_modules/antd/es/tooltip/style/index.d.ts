import type { ArrowOffsetToken } from '../../style/placementArrow';
import type { ArrowToken } from '../../style/roundedArrow';
import type { GetDefaultToken } from '../../theme/internal';
export interface ComponentToken extends ArrowOffsetToken, ArrowToken {
    /**
     * @since 6.2.0
     * @desc 文字提示最大宽度
     * @descEN Max width of tooltip
     */
    maxWidth: number;
    /**
     * @desc 文字提示 z-index
     * @descEN z-index of tooltip
     */
    zIndexPopup: number;
}
export declare const prepareComponentToken: GetDefaultToken<'Tooltip'>;
declare const _default: (prefixCls: string, rootCls: string, injectStyle?: boolean) => readonly [string, string];
export default _default;

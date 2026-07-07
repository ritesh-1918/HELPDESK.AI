import type { CSSObject } from '@ant-design/cssinjs';
import type { GetDefaultToken } from '../../theme/internal';
export interface ComponentToken {
    /**
     * @desc 星星颜色
     * @descEN Star color
     */
    starColor: string;
    /**
     * @desc 星星尺寸
     * @descEN Star size
     */
    starSize: number;
    /**
     * @desc 小星星尺寸
     * @descEN Small star size
     */
    starSizeSM: number;
    /**
     * @desc 大星星尺寸
     * @descEN Large star size
     */
    starSizeLG: number;
    /**
     * @desc 星星悬浮时的缩放
     * @descEN Scale of star when hover
     */
    starHoverScale: CSSObject['transform'];
    /**
     * @desc 星星背景色
     * @descEN Star background color
     */
    starBg: string;
}
export declare const prepareComponentToken: GetDefaultToken<'Rate'>;
declare const _default: (prefixCls: string, rootCls?: string) => readonly [string, string];
export default _default;

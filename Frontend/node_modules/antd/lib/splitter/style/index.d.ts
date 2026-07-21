import type { GetDefaultToken } from '../../theme/internal';
export interface ComponentToken {
    /**
     * @desc 拖拽标识元素大小
     * @descEN Drag and drop the identity element size
     * @deprecated Please use `splitBarDraggableSize` instead.
     */
    resizeSpinnerSize: number;
    /**
     * @desc 拖拽标识元素大小
     * @descEN Drag and drop the identity element size
     */
    splitBarDraggableSize: number;
    /**
     * @desc 拖拽元素显示大小
     * @descEN Drag the element display size
     */
    splitBarSize: number;
    /**
     * @desc 拖拽触发区域大小
     * @descEN Drag and drop trigger area size
     */
    splitTriggerSize: number;
}
export declare const prepareComponentToken: GetDefaultToken<'Splitter'>;
declare const _default: (prefixCls: string, rootCls?: string) => readonly [string, string];
export default _default;

import React from 'react';
export type ColorBlockProps = {
    color: string;
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Internal usage. Only used in antd ColorPicker semantic structure only */
    innerClassName?: string;
    /** Internal usage. Only used in antd ColorPicker semantic structure only */
    innerStyle?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
};
declare const ColorBlock: React.FC<ColorBlockProps>;
export default ColorBlock;

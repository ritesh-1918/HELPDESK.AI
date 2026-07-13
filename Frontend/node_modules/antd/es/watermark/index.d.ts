import React from 'react';
export interface WatermarkProps {
    zIndex?: number;
    rotate?: number;
    width?: number;
    height?: number;
    image?: string;
    content?: string | string[];
    font?: {
        color?: CanvasFillStrokeStyles['fillStyle'];
        fontSize?: number | string;
        fontWeight?: 'normal' | 'lighter' | 'bold' | 'bolder' | number;
        fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
        fontFamily?: string;
        textAlign?: CanvasTextAlign;
    };
    style?: React.CSSProperties;
    className?: string;
    rootClassName?: string;
    gap?: [number, number];
    offset?: [number, number];
    children?: React.ReactNode;
    inherit?: boolean;
    /**
     * @since 6.0.0
     */
    onRemove?: () => void;
}
declare const Watermark: React.FC<WatermarkProps>;
export default Watermark;

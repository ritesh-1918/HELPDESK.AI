import type { StrokeLinecapType } from "../interface";
import React from 'react';
interface IndeterminateOption {
    id: string;
    loading: boolean;
    percent: number;
    strokeLinecap: StrokeLinecapType;
    strokeWidth: number;
}
declare const _default: (options: IndeterminateOption) => {
    indeterminateStyleProps: {
        strokeDasharray?: undefined;
        animation?: undefined;
        strokeDashoffset?: undefined;
    };
    indeterminateStyleAnimation: any;
} | {
    indeterminateStyleProps: {
        strokeDasharray: string;
        animation: string;
        strokeDashoffset: number;
    };
    indeterminateStyleAnimation: React.JSX.Element;
};
export default _default;

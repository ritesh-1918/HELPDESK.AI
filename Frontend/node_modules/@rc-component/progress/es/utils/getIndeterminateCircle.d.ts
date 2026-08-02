import React from 'react';
interface IndeterminateOption {
    id: string;
    loading: boolean;
}
declare const _default: ({ id, loading }: IndeterminateOption) => {
    indeterminateStyleProps: {
        transform?: undefined;
        animation?: undefined;
    };
    indeterminateStyleAnimation: any;
} | {
    indeterminateStyleProps: {
        transform: string;
        animation: string;
    };
    indeterminateStyleAnimation: React.JSX.Element;
};
export default _default;

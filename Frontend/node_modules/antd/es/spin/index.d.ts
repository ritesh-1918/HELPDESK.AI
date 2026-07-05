import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
declare const _SpinSizes: readonly ["small", "default", "large"];
export type SpinSize = (typeof _SpinSizes)[number];
export type SpinIndicator = React.ReactElement<HTMLElement>;
export type SpinSemanticName = keyof SpinSemanticClassNames & keyof SpinSemanticStyles;
export type SpinSemanticClassNames = {
    root?: string;
    section?: string;
    indicator?: string;
    description?: string;
    container?: string;
    /** @deprecated Please use `description` instead */
    tip?: string;
    /** @deprecated Please use `root` instead */
    mask?: string;
};
export type SpinSemanticStyles = {
    root?: React.CSSProperties;
    section?: React.CSSProperties;
    indicator?: React.CSSProperties;
    description?: React.CSSProperties;
    container?: React.CSSProperties;
    /** @deprecated Please use `description` instead */
    tip?: React.CSSProperties;
    /** @deprecated Please use `root` instead */
    mask?: React.CSSProperties;
};
export type SpinClassNamesType = SemanticClassNamesType<SpinProps, SpinSemanticClassNames>;
export type SpinStylesType = SemanticStylesType<SpinProps, SpinSemanticStyles>;
export interface SpinProps {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    /** Whether Spin is spinning */
    spinning?: boolean;
    style?: React.CSSProperties;
    size?: SpinSize;
    /** Customize description content when Spin has children */
    /** @deprecated Please use `description` instead */
    tip?: React.ReactNode;
    description?: React.ReactNode;
    /** Specifies a delay in milliseconds for loading state (prevent flush) */
    delay?: number;
    /** The className of wrapper when Spin has children */
    /** @deprecated Please use `classNames.root` instead */
    wrapperClassName?: string;
    /** React node of the spinning indicator */
    indicator?: SpinIndicator;
    children?: React.ReactNode;
    /** Display a backdrop with the `Spin` component */
    fullscreen?: boolean;
    percent?: number | 'auto';
    classNames?: SpinClassNamesType;
    styles?: SpinStylesType;
}
export type SpinType = React.FC<SpinProps> & {
    setDefaultIndicator: (indicator: React.ReactNode) => void;
};
declare const Spin: SpinType;
export default Spin;

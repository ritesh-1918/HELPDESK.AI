import * as React from 'react';
import type { Orientation, SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { SizeType } from '../config-provider/SizeContext';
import Addon from './Addon';
import Compact from './Compact';
export { SpaceContext } from './context';
export type SpaceSize = SizeType | number;
export type SpaceSemanticName = keyof SpaceSemanticClassNames & keyof SpaceSemanticStyles;
export type SpaceSemanticClassNames = {
    root?: string;
    item?: string;
    separator?: string;
};
export type SpaceSemanticStyles = {
    root?: React.CSSProperties;
    item?: React.CSSProperties;
    separator?: React.CSSProperties;
};
export type SpaceClassNamesType = SemanticClassNamesType<SpaceProps, SpaceSemanticClassNames>;
export type SpaceStylesType = SemanticStylesType<SpaceProps, SpaceSemanticStyles>;
export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    style?: React.CSSProperties;
    size?: SpaceSize | [SpaceSize, SpaceSize];
    /** @deprecated please use `orientation` instead */
    direction?: Orientation;
    vertical?: boolean;
    orientation?: Orientation;
    align?: 'start' | 'end' | 'center' | 'baseline';
    /** @deprecated please use `separator` instead */
    split?: React.ReactNode;
    separator?: React.ReactNode;
    wrap?: boolean;
    classNames?: SpaceClassNamesType;
    styles?: SpaceStylesType;
}
declare const InternalSpace: React.ForwardRefExoticComponent<SpaceProps & React.RefAttributes<HTMLDivElement>>;
type CompoundedComponent = typeof InternalSpace & {
    Compact: typeof Compact;
    Addon: typeof Addon;
};
declare const Space: CompoundedComponent;
export default Space;

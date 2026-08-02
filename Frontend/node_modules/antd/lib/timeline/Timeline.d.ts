import * as React from 'react';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks';
import type { GetProp, LiteralUnion } from '../_util/type';
import type { StepsProps, StepsSemanticClassNames, StepsSemanticName, StepsSemanticStyles } from '../steps';
export type ItemPosition = 'left' | 'right' | 'start' | 'end';
export type ItemPlacement = 'start' | 'end';
export type TimelineMode = ItemPosition | 'alternate';
type Color = 'blue' | 'red' | 'green' | 'gray';
export interface TimelineItemType {
    color?: LiteralUnion<Color>;
    className?: string;
    style?: React.CSSProperties;
    classNames?: GetProp<StepsProps, 'items'>[number]['classNames'];
    styles?: GetProp<StepsProps, 'items'>[number]['styles'];
    placement?: ItemPlacement;
    /** @deprecated please use `placement` instead */
    position?: ItemPosition;
    loading?: boolean;
    key?: React.Key;
    title?: React.ReactNode;
    content?: React.ReactNode;
    /** @deprecated Please use `title` instead */
    label?: React.ReactNode;
    /** @deprecated Please use `content` instead */
    children?: React.ReactNode;
    icon?: React.ReactNode;
    /** @deprecated Please use `icon` instead */
    dot?: React.ReactNode;
}
export type TimelineSemanticName = StepsSemanticName;
export type TimelineSemanticClassNames = StepsSemanticClassNames;
export type TimelineSemanticStyles = StepsSemanticStyles;
export type TimelineClassNamesType = SemanticClassNamesType<TimelineProps, TimelineSemanticClassNames>;
export type TimelineStylesType = SemanticStylesType<TimelineProps, TimelineSemanticStyles>;
export interface TimelineProps {
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    classNames?: TimelineClassNamesType;
    styles?: TimelineStylesType;
    rootClassName?: string;
    variant?: StepsProps['variant'];
    mode?: TimelineMode;
    orientation?: 'horizontal' | 'vertical';
    titleSpan?: string | number;
    items?: TimelineItemType[];
    children?: React.ReactNode;
    /** @deprecated Please add pending item in `items` directly */
    pending?: React.ReactNode;
    /** @deprecated Please add pending item in `items` directly */
    pendingDot?: React.ReactNode;
    reverse?: boolean;
}
type CompoundedComponent = React.FC<TimelineProps> & {
    Item: React.FC<TimelineItemType>;
};
declare const Timeline: CompoundedComponent;
export default Timeline;

import * as React from 'react';
import type { Status, StepItem, StepsProps } from './Steps';
export interface StepProps {
    prefixCls?: string;
    classNames: StepsProps['classNames'];
    styles: StepsProps['styles'];
    data: StepItem;
    nextStatus?: Status;
    active?: boolean;
    index: number;
    last: boolean;
    iconRender?: StepsProps['iconRender'];
    icon?: React.ReactNode;
    itemRender?: StepsProps['itemRender'];
    itemWrapperRender?: StepsProps['itemWrapperRender'];
    onClick: (index: number) => void;
}
export default function Step(props: StepProps): React.ReactElement<any, string | React.JSXElementConstructor<any>>;

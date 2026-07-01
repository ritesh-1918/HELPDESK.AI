import React from 'react';
import type StepIcon from './StepIcon';
export type Status = 'error' | 'process' | 'finish' | 'wait';
export type SemanticName = 'root' | 'item' | 'itemWrapper' | 'itemHeader' | 'itemTitle' | 'itemSubtitle' | 'itemSection' | 'itemContent' | 'itemIcon' | 'itemRail';
export type ItemSemanticName = 'root' | 'wrapper' | 'header' | 'title' | 'subtitle' | 'section' | 'content' | 'icon' | 'rail';
export type ComponentType = React.ComponentType<any> | string;
export type StepItem = {
    /** @deprecated Please use `content` instead. */
    description?: React.ReactNode;
    content?: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    status?: Status;
    subTitle?: React.ReactNode;
    title?: React.ReactNode;
    classNames?: Partial<Record<ItemSemanticName, string>>;
    styles?: Partial<Record<ItemSemanticName, React.CSSProperties>>;
} & Pick<React.HtmlHTMLAttributes<HTMLLIElement>, 'onClick' | 'className' | 'style'>;
export type StepIconRender = (info: {
    index: number;
    status: Status;
    title: React.ReactNode;
    description: React.ReactNode;
    content: React.ReactNode;
    node: React.ReactNode;
}) => React.ReactNode;
export type RenderInfo = {
    index: number;
    active: boolean;
    item: StepItem;
};
export interface StepsProps {
    prefixCls?: string;
    style?: React.CSSProperties;
    className?: string;
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    rootClassName?: string;
    orientation?: 'horizontal' | 'vertical';
    titlePlacement?: 'horizontal' | 'vertical';
    /** Internal usage of antd. Do not deps on this. */
    components?: {
        root?: ComponentType;
        item?: ComponentType;
    };
    status?: Status;
    current?: number;
    initial?: number;
    items?: StepItem[];
    onChange?: (current: number) => void;
    iconRender?: (originNode: React.ReactElement, info: RenderInfo & {
        components: {
            Icon: typeof StepIcon;
        };
    }) => React.ReactNode;
    itemRender?: (originNode: React.ReactElement, info: RenderInfo) => React.ReactNode;
    itemWrapperRender?: (originNode: React.ReactElement) => React.ReactNode;
}
export default function Steps(props: StepsProps): React.JSX.Element;

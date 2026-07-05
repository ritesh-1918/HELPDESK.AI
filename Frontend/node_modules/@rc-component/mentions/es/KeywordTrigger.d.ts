import type { FC } from 'react';
import * as React from 'react';
import type { DataDrivenOptionProps, Direction, Placement } from './Mentions';
interface KeywordTriggerProps {
    loading?: boolean;
    options: DataDrivenOptionProps[];
    prefixCls?: string;
    placement?: Placement;
    direction?: Direction;
    visible?: boolean;
    transitionName?: string;
    children?: React.ReactElement;
    getPopupContainer?: () => HTMLElement;
    popupClassName?: string;
    popupStyle?: React.CSSProperties;
}
declare const KeywordTrigger: FC<KeywordTriggerProps>;
export default KeywordTrigger;

import * as React from 'react';
import type { FloatButtonProps } from './FloatButton';
import type { FloatButtonGroupProps } from './FloatButtonGroup';
export interface PureFloatButtonProps extends Omit<FloatButtonProps, 'target'> {
    backTop?: boolean;
}
type ClassNamesType = PureFloatButtonProps['classNames'] | FloatButtonGroupProps['classNames'];
type StylesType = PureFloatButtonProps['styles'] | FloatButtonGroupProps['styles'];
export interface PurePanelProps extends Omit<PureFloatButtonProps, 'classNames' | 'styles'>, Omit<FloatButtonGroupProps, 'children' | 'classNames' | 'styles'> {
    /** Convert to FloatGroup when configured */
    items?: PureFloatButtonProps[];
    classNames?: ClassNamesType;
    styles?: StylesType;
}
/** @private Internal Component. Do not use in your production. */
declare const PurePanel: React.FC<PurePanelProps>;
export default PurePanel;

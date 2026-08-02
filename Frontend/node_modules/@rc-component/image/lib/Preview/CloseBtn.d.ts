import * as React from 'react';
export interface CloseBtnProps {
    prefixCls: string;
    icon?: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}
export default function CloseBtn(props: CloseBtnProps): React.JSX.Element;

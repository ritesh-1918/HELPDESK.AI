import * as React from 'react';
export interface FooterRowProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLTableRowElement>;
}
declare const FooterRow: React.FC<React.PropsWithChildren<FooterRowProps>>;
export default FooterRow;

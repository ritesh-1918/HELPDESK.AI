import * as React from 'react';
export interface TitleProps {
    className: string;
    style: React.CSSProperties;
}
declare const Panel: React.FC<React.PropsWithChildren<TitleProps>>;
export default Panel;

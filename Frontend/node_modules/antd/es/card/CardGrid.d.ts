import * as React from 'react';
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
    prefixCls?: string;
    className?: string;
    hoverable?: boolean;
    style?: React.CSSProperties;
}
declare const CardGrid: React.FC<CardGridProps>;
export default CardGrid;

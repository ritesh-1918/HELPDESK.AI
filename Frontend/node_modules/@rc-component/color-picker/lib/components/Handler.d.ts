import React from 'react';
type HandlerSize = 'default' | 'small';
declare const Handler: React.FC<{
    size?: HandlerSize;
    color?: string;
    prefixCls?: string;
}>;
export default Handler;

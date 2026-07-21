import * as React from 'react';
export type QueueCreate = (appendFunc: VoidFunction) => void;
declare const OrderContext: React.Context<QueueCreate>;
export default OrderContext;

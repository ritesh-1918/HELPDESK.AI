import type { ReactNode } from 'react';
import type { TooltipProps } from '../tooltip';
declare const convertToTooltipProps: <P extends TooltipProps>(tooltip: P | ReactNode, context?: P) => P | null;
export default convertToTooltipProps;

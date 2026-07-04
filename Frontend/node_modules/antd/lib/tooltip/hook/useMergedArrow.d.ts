import type { AbstractTooltipProps } from '..';
import type { TooltipConfig } from '../../config-provider/context';
interface MergedArrow {
    show: boolean;
    pointAtCenter?: boolean;
}
declare const useMergedArrow: (providedArrow?: AbstractTooltipProps["arrow"], providedContextArrow?: TooltipConfig["arrow"]) => MergedArrow;
export default useMergedArrow;

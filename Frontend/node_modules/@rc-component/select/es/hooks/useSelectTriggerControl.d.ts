import type { TriggerOpenType } from './useOpen';
export declare function isInside(elements: (HTMLElement | SVGElement | undefined)[], target: HTMLElement): boolean;
export default function useSelectTriggerControl(elements: () => (HTMLElement | SVGElement | undefined)[], open: boolean, triggerOpen: TriggerOpenType, customizedTrigger: boolean): void;

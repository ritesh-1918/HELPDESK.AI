import type { OnResize } from '.';
export default function useResizeObserver(enabled: boolean, getTarget: HTMLElement | (() => HTMLElement), onDelayResize?: OnResize, onSyncResize?: OnResize): void;
